#!/usr/bin/env python3
"""
Extract abstracts from PDFs and update matching publication JSON files.
Usage: python3 scripts/extract-abstracts.py
"""

import os
import re
import json
import pdfplumber

PDFS_DIR = os.path.join(os.path.dirname(__file__), '..', 'pdfs')
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'publications_data')


def extract_text(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages = pdf.pages[:4]  # abstract is always in first few pages
            return '\n'.join(p.extract_text() or '' for p in pages)
    except Exception as e:
        return None


def extract_abstract(text):
    if not text:
        return None

    # Normalise whitespace
    text = re.sub(r'\r\n', '\n', text)

    # Look for "Abstract" header (case-insensitive, on its own line or followed by colon/newline)
    pattern = re.search(
        r'\bAbstract[:\s]*\n+([\s\S]{100,1500}?)(?=\n\s*\n\s*[A-Z1-9]|\n\s*(Keywords?|Introduction|Background|1[\.\s])|$)',
        text,
        re.IGNORECASE
    )
    if pattern:
        abstract = pattern.group(1).strip()
        # Collapse internal line breaks (soft wraps)
        abstract = re.sub(r'\n(?!\n)', ' ', abstract)
        abstract = re.sub(r'\s{2,}', ' ', abstract)
        return abstract.strip()

    return None


def pdf_filename_from_json(pub):
    """Extract just the filename from the pdf field."""
    pdf = pub.get('pdf', '')
    if not pdf:
        return None
    return os.path.basename(pdf)


def main():
    # Load all publication JSON files
    json_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.json')]
    pubs = []
    for jf in json_files:
        with open(os.path.join(DATA_DIR, jf)) as f:
            data = json.load(f)
        pubs.append((jf, data))

    updated = 0
    skipped_no_pdf = 0
    skipped_has_abstract = 0
    skipped_not_found = 0
    failed = 0

    for jf, pub in pubs:
        # Skip if abstract already filled in
        if pub.get('abstract', '').strip():
            skipped_has_abstract += 1
            continue

        pdf_filename = pdf_filename_from_json(pub)
        if not pdf_filename:
            skipped_no_pdf += 1
            continue

        pdf_path = os.path.join(PDFS_DIR, pdf_filename)
        if not os.path.exists(pdf_path):
            skipped_not_found += 1
            print(f'  [not found] {pdf_filename}')
            continue

        text = extract_text(pdf_path)
        abstract = extract_abstract(text)

        if abstract:
            pub['abstract'] = abstract
            out_path = os.path.join(DATA_DIR, jf)
            with open(out_path, 'w') as f:
                json.dump(pub, f, indent=2, ensure_ascii=False)
                f.write('\n')
            print(f'  [ok] {jf}')
            print(f'       {abstract[:120]}...')
            updated += 1
        else:
            print(f'  [no abstract found] {pdf_filename}')
            failed += 1

    print(f'\nDone.')
    print(f'  Updated:              {updated}')
    print(f'  Already had abstract: {skipped_has_abstract}')
    print(f'  No PDF field:         {skipped_no_pdf}')
    print(f'  PDF file not found:   {skipped_not_found}')
    print(f'  Could not extract:    {failed}')


if __name__ == '__main__':
    main()
