#!/usr/bin/env python3
"""
Simple TTS tool using Edge-TTS (Microsoft Edge Text-to-Speech)

Install dependencies:
    pip install edge-tts pydub

Usage:
    python tts/tts.py input.txt output_dir
    python tts/tts.py caption/test.txt output/tts

Environment variables (optional):
    EDGE_TTS_VOICE - Voice name (default: 'zh-CN-YunjianNeural')
    List available voices: edge-tts --list-voices
"""

import sys
import os
from pathlib import Path
import subprocess
import asyncio

def check_dependencies():
    """Check if Edge-TTS is installed"""
    try:
        import edge_tts
        return True
    except ImportError:
        return False

def get_audio_duration(audio_path):
    """Get audio file duration in seconds"""
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_mp3(audio_path)
        return len(audio) / 1000.0  # Convert to seconds
    except ImportError:
        # If pydub is not available, try using ffprobe
        try:
            result = subprocess.run(
                ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', 
                 '-of', 'default=noprint_wrappers=1:nokey=1', audio_path],
                capture_output=True,
                text=True
            )
            return float(result.stdout.strip())
        except:
            # If both are unavailable, estimate duration (approx 3.5 chars/sec for Chinese)
            return len(open(audio_path, 'rb').read()) / 16000  # Rough estimate

async def tts_with_edge(text, output_path, voice_name=None, max_retries=3):
    """Use Edge-TTS (online, free, no API key required)"""
    import edge_tts
    import time
    
    # Default voice for Chinese
    if not voice_name:
        voice_name = os.getenv('EDGE_TTS_VOICE', 'zh-CN-YunjianNeural')
    
    for attempt in range(max_retries):
        try:
            communicate = edge_tts.Communicate(text, voice_name)
            await communicate.save(output_path)
            
            # Verify file was created
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise Exception("Generated audio file is empty or not created")
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2  # Exponential backoff: 2s, 4s, 6s
                print(f"  ⚠️  Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                print(f"  Error: {str(e)}")
                await asyncio.sleep(wait_time)
            else:
                raise e
    return False

def format_time(seconds):
    """Convert seconds to VTT time format (HH:MM:SS.mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"

def merge_audio_files(audio_files, output_path, speed=1.0):
    """Merge multiple audio files and adjust speed"""
    try:
        from pydub import AudioSegment
        
        combined = AudioSegment.empty()
        for audio_file in audio_files:
            audio = AudioSegment.from_mp3(audio_file)
            combined += audio
        
        # Adjust speed
        if speed != 1.0:
            combined = combined.speedup(playback_speed=speed)
        
        combined.export(output_path, format="mp3")
        return True
    except ImportError:
        # If pydub is not available, use ffmpeg
        try:
            # Create file list
            file_list_path = output_path + '.txt'
            with open(file_list_path, 'w') as f:
                for audio_file in audio_files:
                    f.write(f"file '{os.path.abspath(audio_file)}'\n")
            
            # Merge using ffmpeg
            subprocess.run([
                'ffmpeg', '-f', 'concat', '-safe', '0', 
                '-i', file_list_path, '-c', 'copy', output_path
            ], check=True, capture_output=True)
            
            os.remove(file_list_path)
            return True
        except Exception as e:
            print(f"❌ Failed to merge audio: {e}")
            return False


def split_text_for_vtt(text, max_length=30):
    """Split text into segments of max_length characters for VTT subtitles
    Only splits at Chinese (full-width) sentence-ending punctuation marks to avoid cutting in the middle of sentences.
    Uses only full-width (全角) punctuation to avoid splitting at decimal points in numbers:
    - Full-width: 。！？ (period, exclamation, question mark)
    Does not split at mid-sentence punctuation like commas (，,) or enumeration marks (、).
    Does not split at half-width punctuation (.!?) to avoid splitting decimal numbers (e.g., 1.43%, 3.14).
    If no sentence-ending punctuation is found within max_length, allows exceeding max_length
    (up to max_length * 2) to find the next sentence boundary, rather than cutting mid-sentence.
    """
    if len(text) <= max_length:
        return [text]
    
    segments = []
    # Only use Chinese (full-width) sentence-ending punctuation marks
    # Do NOT use half-width punctuation (.!?) to avoid splitting decimal numbers
    sentence_endings = '。！？'  # Only full-width Chinese punctuation
    
    remaining = text
    while len(remaining) > max_length:
        split_pos = -1
        
        # First, try to find a sentence-ending punctuation within max_length
        # Search backwards from max_length to find the last sentence-ending punctuation
        for i in range(min(max_length, len(remaining)) - 1, -1, -1):
            if remaining[i] in sentence_endings:
                split_pos = i + 1
                break
        
        # If found sentence-ending punctuation within max_length, use it
        if split_pos > 0:
            segment = remaining[:split_pos].strip()
            if segment:
                segments.append(segment)
            remaining = remaining[split_pos:].strip()
        else:
            # No sentence-ending punctuation found within max_length
            # Look ahead to find the next sentence-ending punctuation
            # First try within max_length * 2, but if not found, search the entire remaining text
            # This prevents cutting in the middle of sentences
            found_sentence_end = False
            
            # First, try to find within max_length * 2 (preferred limit)
            lookahead_limit = min(max_length * 2, len(remaining))
            for i in range(max_length, lookahead_limit):
                if remaining[i] in sentence_endings:
                    split_pos = i + 1
                    found_sentence_end = True
                    break
            
            # If not found within max_length * 2, search the entire remaining text
            # This ensures we find sentence endings even in very long sentences
            if not found_sentence_end:
                for i in range(max_length, len(remaining)):
                    if remaining[i] in sentence_endings:
                        split_pos = i + 1
                        found_sentence_end = True
                        break
            
            if found_sentence_end:
                # Found sentence-ending punctuation, use it even if exceeds max_length
                segment = remaining[:split_pos].strip()
                if segment:
                    segments.append(segment)
                remaining = remaining[split_pos:].strip()
            else:
                # Still no sentence-ending punctuation found in the entire remaining text
                # This should be very rare - only happens if text is extremely long without sentence endings
                # In this case, keep the entire remaining text as one segment to avoid mid-sentence cuts
                # This allows the segment to exceed max_length rather than cutting mid-sentence
                segments.append(remaining.strip())
                remaining = ''
    
    # Add remaining text
    if remaining:
        segments.append(remaining)
    
    return segments

def generate_vtt(lines, durations, output_path, vtt_max_length=30):
    """Generate VTT subtitle file
    Each TTS segment (up to 2000 chars) is further split into VTT segments (max 30 chars)
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("WEBVTT\n\n")
        
        current_time = 0.0
        vtt_index = 1
        
        for text, duration in zip(lines, durations):
            # Split the TTS segment into smaller VTT segments (max 30 chars each)
            vtt_segments = split_text_for_vtt(text, vtt_max_length)
            
            # Calculate duration per VTT segment (proportional to text length)
            if len(vtt_segments) == 1:
                # Single segment, use full duration
                segment_durations = [duration]
            else:
                # Multiple segments, distribute duration proportionally
                total_chars = len(text)
                segment_durations = []
                for segment in vtt_segments:
                    segment_ratio = len(segment) / total_chars
                    segment_durations.append(duration * segment_ratio)
            
            # Write each VTT segment
            for segment_text, segment_duration in zip(vtt_segments, segment_durations):
                start_time = current_time
                end_time = current_time + segment_duration
                
                f.write(f"{vtt_index}\n")
                f.write(f"{format_time(start_time)} --> {format_time(end_time)}\n")
                f.write(f"{segment_text}\n\n")
                
                current_time = end_time
                vtt_index += 1

def split_by_punctuation(text, max_length=2000):
    """Split text by Chinese and English punctuation marks
    If a sentence exceeds max_length characters, split it further at punctuation marks
    """
    # All punctuation marks: 。，、；：？！.?,;:!?
    punctuation_marks = '。，、；：？！.?,;:!?'
    
    sentences = []
    current_sentence = ''
    
    for char in text:
        # Add character to current sentence
        test_sentence = current_sentence + char
        test_stripped = test_sentence.strip()
        
        # Check if adding this char would exceed max_length
        if len(test_stripped) > max_length:
            # Need to split before adding this char
            if current_sentence.strip():
                temp = current_sentence.strip()
                # Find the last punctuation mark before max_length
                split_pos = -1
                for j in range(min(max_length, len(temp)), 0, -1):
                    if temp[j-1] in punctuation_marks:
                        split_pos = j
                        break
                
                if split_pos > 0:
                    # Split at punctuation
                    sentences.append(temp[:split_pos].strip())
                    current_sentence = temp[split_pos:] + char
                else:
                    # No punctuation found, force split at max_length
                    sentences.append(temp[:max_length].strip())
                    current_sentence = temp[max_length:] + char
            else:
                # Current sentence is empty or whitespace, just add char
                current_sentence += char
        else:
            # Safe to add char
            current_sentence += char
            
            # If we hit a sentence-ending punctuation, finalize
            if char in '。！？.':
                if current_sentence.strip():
                    sentences.append(current_sentence.strip())
                current_sentence = ''
    
    # Handle remaining text
    if current_sentence.strip():
        remaining = current_sentence.strip()
        while len(remaining) > max_length:
            # Find punctuation in remaining text
            split_pos = -1
            for j in range(min(max_length, len(remaining)), 0, -1):
                if remaining[j-1] in punctuation_marks:
                    split_pos = j
                    break
            
            if split_pos > 0:
                sentences.append(remaining[:split_pos].strip())
                remaining = remaining[split_pos:]
            else:
                sentences.append(remaining[:max_length].strip())
                remaining = remaining[max_length:]
        
        if remaining.strip():
            sentences.append(remaining.strip())
    
    return [s for s in sentences if s]

async def process_file_async(input_file, output_dir='output/tts'):
    """Process subtitle file (async version)"""
    # Check dependencies
    if not check_dependencies():
        print("❌ Edge-TTS library not found")
        print("Please install: pip install edge-tts pydub")
        return False
    
    # Read input file
    if not os.path.exists(input_file):
        print(f"❌ File not found: {input_file}")
        return False
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by paragraphs (each line is a paragraph)
    # Each paragraph becomes a single TTS unit
    # No splitting by punctuation marks - each paragraph is processed as a whole
    lines = []
    for line in content.split('\n'):
        line = line.strip()
        # Only add non-empty lines as paragraphs
        if line:
            lines.append(line)
    
    if not lines:
        print("❌ File is empty")
        return False
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    voice_name = os.getenv('EDGE_TTS_VOICE', 'zh-CN-YunjianNeural')
    print(f"🎙️  Using Edge-TTS to generate audio")
    print(f"🔊 Voice: {voice_name}")
    print(f"📝 Found {len(lines)} lines of text\n")
    
    # Generate temporary audio files with batch processing (3 concurrent requests)
    BATCH_SIZE = 3
    temp_audio_files = []
    durations = []
    
    async def process_sentence(i, text):
        """Process a single sentence"""
        print(f"[{i}/{len(lines)}] Generating: {text[:30]}...")
        print(f"    Text length: {len(text)} characters")
        
        temp_path = os.path.join(output_dir, f"sentence{i}.mp3")
        
        try:
            await tts_with_edge(text, temp_path, voice_name)
            
            # Get audio duration
            duration = get_audio_duration(temp_path)
            
            print(f"✅ Saved: {temp_path} (duration: {duration:.2f}s)\n")
            return (i, temp_path, duration, None)
        except Exception as e:
            print(f"❌ Failed: {e}\n")
            print(f"    Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return (i, None, None, e)
    
    # Process sentences in batches of 3
    print(f"🚀 Processing {len(lines)} sentences in batches of {BATCH_SIZE}...\n")
    
    for batch_start in range(0, len(lines), BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, len(lines))
        batch_lines = lines[batch_start:batch_end]
        batch_indices = range(batch_start + 1, batch_end + 1)
        
        # Create tasks for this batch
        tasks = [process_sentence(i, text) for i, text in zip(batch_indices, batch_lines)]
        
        # Execute batch concurrently
        results = await asyncio.gather(*tasks)
        
        # Process results (sort by index to maintain order)
        results_sorted = sorted(results, key=lambda x: x[0])
        for i, temp_path, duration, error in results_sorted:
            if error:
                return False
            if temp_path and duration is not None:
                temp_audio_files.append(temp_path)
                durations.append(duration)
    
    # Merge audio files and adjust speed to 1.1x
    SPEED_FACTOR = 1.1
    print(f"🔗 Merging audio files and adjusting speed to {SPEED_FACTOR}x...")
    merged_audio_path = os.path.join(output_dir, 'audio.mp3')
    if merge_audio_files(temp_audio_files, merged_audio_path, speed=SPEED_FACTOR):
        print(f"✅ Merge completed: {merged_audio_path}\n")
    else:
        print("❌ Merge failed")
        return False
    
    # Adjust durations (because speed is increased, actual duration will be shorter)
    adjusted_durations = [d / SPEED_FACTOR for d in durations]
    
    # Generate VTT file (using adjusted durations)
    print("📝 Generating VTT subtitle file...")
    vtt_path = os.path.join(output_dir, 'audio.vtt')
    generate_vtt(lines, adjusted_durations, vtt_path)
    print(f"✅ VTT file saved: {vtt_path}\n")
    
    # Delete temporary files
    print("🗑️  Deleting temporary files...")
    for temp_file in temp_audio_files:
        try:
            os.remove(temp_file)
            print(f"  Deleted: {os.path.basename(temp_file)}")
        except Exception as e:
            print(f"  Warning: Unable to delete {temp_file}: {e}")
    
    total_duration = sum(adjusted_durations)
    print(f"\n✅ Complete!")
    print(f"   - Merged audio: {merged_audio_path}")
    print(f"   - VTT subtitles: {vtt_path}")
    print(f"   - Total duration: {total_duration:.2f}s (speeded up {SPEED_FACTOR}x)")
    
    return True

def process_file(input_file, output_dir='output/tts'):
    """Process subtitle file (wrapper for async function)"""
    return asyncio.run(process_file_async(input_file, output_dir))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python tts/tts.py <input_file> [output_dir]")
        print("Example: python tts/tts.py caption/test.txt output/tts")
        print("\nOptional environment variable:")
        print("  EDGE_TTS_VOICE - Voice name (default: 'zh-CN-YunjianNeural', example: 'zh-CN-XiaoxiaoNeural')")
        print("  List available voices: edge-tts --list-voices")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'output/tts'
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        sys.exit(1)
    
    process_file(input_file, output_dir)
