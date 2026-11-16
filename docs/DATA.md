# Data

MentiSphere does not ship atlas files, surfaces or meshes. Licensed source files, built meshes, label arrays and your own result files stay on your machine, outside git.

## The data folder

Set `MENTI_DATA` to a local folder that is not inside a git checkout. It holds:

- downloaded source files (surfaces, atlases, templates),
- built meshes and label arrays produced by the pipeline,
- caches.

Your own result files (parcel tables, CIFTI, GIFTI) are read from the local paths you give. They are never copied into the repository or into this folder.

## Source manifest

`pipeline/sources.yaml` lists every external source. Each entry has:

| Field | Meaning |
| --- | --- |
| `key` | Unique short name, for example `hcpmmp1`. |
| `kind` | What the source is, such as a surface or an atlas. |
| `name`, `version` | Full name and release. |
| `space` | Coordinate space of the data, for example `fsLR-32k`. |
| `license.name`, `license.url` | License or data use terms. |
| `license.local_use` | `true` if the terms allow using the files locally. `null` means not decided. |
| `license.copy_between_own_machines` | Whether you may copy the files between your own machines. |
| `license.redistribute` | Whether the files may be redistributed. |
| `license.attribution` | Required acknowledgement text. |
| `license.audited` | Date the terms were read and recorded. `null` means not audited. |
| `citation.text`, `citation.doi` | How to cite the source. |
| `acquisition` | How to obtain the file, `fetch` or `manual` (below). |

Check the manifest with:

```bash
menti-pipeline check-sources
menti-pipeline check-sources path/to/sources.yaml
```

## When a source is built

The pipeline builds a source only when all three hold:

1. the license is audited (`license.audited` is set),
2. `license.local_use` is `true`,
3. a `sha256` checksum is recorded in `acquisition`.

Otherwise the build stops with a message naming the missing condition.

## Fetch and manual sources

A `fetch` source has a `url` and a `sha256`. The pipeline downloads the file into `$MENTI_DATA` and verifies the checksum.

A `manual` source cannot be downloaded automatically, usually because the provider requires you to accept data use terms first. Its entry has an `instructions_url`, the expected `filename` and a `sha256`. Download the file from the instructions page, accept the terms, and place it in the sources folder inside `$MENTI_DATA` under exactly that filename. The pipeline verifies the checksum before using it.

## What the data guard rejects

`scripts/check_no_data_files.py` runs in CI and checks every tracked file. It rejects:

- files with a data or mesh suffix (for example `.nii`, `.nii.gz`, `.gii`, `.mgz`, `.annot`, `.glb`, `.npy`, `.csv`, `.tsv`), compared case-insensitively against the full suffix,
- files larger than 1 MB,
- text that matches a leak pattern: participant identifiers of the form `NDAR` plus eight characters, and absolute home or cluster paths.

Run it locally:

```bash
python3.12 scripts/check_no_data_files.py
```

`scripts/data_guard_allow.txt` lists repo-relative paths that skip the size and leak checks. It cannot exempt a file from the data-suffix check. Keep real data in `$MENTI_DATA`.
