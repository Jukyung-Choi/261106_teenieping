"""Apply a live-demo JSON recipe to copies of Teenieping assets.

Requires Pillow and NumPy. Never overwrites source assets.
python3 tools/adjust_teenieping_colors.py --settings downloaded.json \
    --source-dir assets --output-dir /path/to/color-copies
"""
import argparse
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

ALGORITHM = 'srgb-matrix-levels-v1'


def normalize(values):
    def number(key, fallback, low, high, precision=0):
        try:
            value = float(values.get(key, fallback))
        except (ValueError, TypeError):
            value = fallback
        if not math.isfinite(value):
            value = fallback
        value = max(low, min(high, value))
        return math.floor(value * 10**precision + .5) / 10**precision
    black = int(number('black', 0, 0, 254))
    return dict(saturation=number('saturation', 25, -100, 100), black=black,
                gamma=number('gamma', 1, .1, 3, 2),
                white=number('white', 240, black+1, 255))


def adjust(frame, settings, enabled=True):
    rgba = np.asarray(frame.convert('RGBA')).copy()
    if not enabled:
        return Image.fromarray(rgba)
    rgb = rgba[..., :3].astype(np.float64)
    factor = 1 + settings['saturation']/100
    luminance = rgb @ np.array([.213, .715, .072])
    saturated = np.clip(luminance[..., None] + (rgb-luminance[..., None])*factor, 0, 255)
    index = np.arange(256, dtype=np.float64)
    table = np.clip((index-settings['black'])/(settings['white']-settings['black']), 0, 1)**(1/settings['gamma'])
    table = np.floor(table*1e7+.5)/1e7
    result = np.interp(saturated, index, table)*255
    rgba[..., :3] = np.clip(np.floor(result+.5), 0, 255).astype(np.uint8)
    return Image.fromarray(rgba)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--settings', type=Path, required=True)
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--quality', type=float, default=80)
    parser.add_argument('--lossless', action='store_true')
    args = parser.parse_args()
    payload = json.loads(args.settings.read_text())
    if payload.get('version') != 2 or payload.get('algorithm') != ALGORITHM:
        parser.error('Use a settings file saved by the live color demo (version 2).')
    source, output = args.source_dir.resolve(), args.output_dir.resolve()
    if source == output or source in output.parents or output in source.parents:
        parser.error('The output directory must be separate from the source directory.')
    if not 0 <= args.quality <= 100:
        parser.error('Quality must be between 0 and 100.')
    settings = normalize(payload.get('settings', {}))
    enabled = payload.get('enabled') is not False
    paths = [p for folder in ['teeniepings-webp','teeniepings-closed','teeniepings-still']
             for p in sorted((source/folder).glob('*')) if p.suffix.lower() in ['.webp','.png']]
    if not paths:
        parser.error('No source Teenieping assets found.')
    targets = [output / p.relative_to(source) for p in paths]
    if any(p.exists() for p in targets):
        parser.error('Output already contains one or more destination files. Choose a new directory.')
    report = []
    for path, destination in zip(paths, targets):
        with Image.open(path) as image:
            metadata = dict(image.info)
            frames, durations, alpha = [], [], []
            for index in range(image.n_frames):
                image.seek(index); image.load()
                frame = image.convert('RGBA')
                alpha.append(np.asarray(frame)[..., 3].copy())
                frames.append(adjust(frame, settings, enabled))
                if image.n_frames > 1:
                    durations.append(image.info['duration'])
        destination.parent.mkdir(parents=True, exist_ok=True)
        options = {}
        if metadata.get('icc_profile'):
            options['icc_profile'] = metadata['icc_profile']
        if path.suffix.lower() == '.webp':
            options.update(lossless=args.lossless, quality=args.quality, alpha_quality=100, method=4)
            if len(frames) > 1:
                options.update(save_all=True, append_images=frames[1:], duration=durations,
                               loop=metadata.get('loop', 0), background=metadata.get('background',(0,0,0,0)))
        frames[0].save(destination, **options)
        with Image.open(destination) as decoded:
            assert decoded.n_frames == len(frames), f'Frame mismatch: {destination}'
            actual_durations = []
            for index in range(decoded.n_frames):
                decoded.seek(index); decoded.load()
                assert decoded.size == frames[index].size
                assert np.array_equal(np.asarray(decoded.convert('RGBA'))[..., 3], alpha[index])
                if len(frames) > 1:
                    actual_durations.append(decoded.info['duration'])
            assert actual_durations == durations
            if len(frames)>1:
                assert decoded.info.get('loop',0) == metadata.get('loop',0)
        report.append(dict(file=str(path.relative_to(source)),frames=len(frames),bytes=destination.stat().st_size))
    (output/'color-adjustment-report.json').write_text(json.dumps(dict(
        algorithm=ALGORITHM,enabled=enabled,settings=settings,files=report),ensure_ascii=False,indent=2))
    print(f'Saved {len(report)} corrected copies to {output}; originals unchanged.')


if __name__ == '__main__':
    main()
