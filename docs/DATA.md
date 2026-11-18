# Data

MentiSphere does not ship atlas files, surfaces or meshes. Licensed source files, built meshes and label arrays will live on your machine in `$MENTI_DATA`, outside git. Your own result files stay where they are.

## The data folder

Set `MENTI_DATA` to a local folder that is not inside a git checkout. The pipeline stages that use it are not implemented yet; today only the manifest check below exists. The folder is planned to hold:

- downloaded source files (surfaces, atlases, templates),
- built meshes and label arrays produced by the pipeline,
- caches.

Your own result files (parcel tables, CIFTI, GIFTI) will be read from the local paths you give. They are never copied into the repository or into this folder.

## Source manifest

`pipeline/sources.yaml` lists every external source. Each entry has:

| Field | Meaning |
| --- | --- |
| `key` | Unique short name, for example `hcpmmp1`. |
| `kind` | What the source is, such as a surface or an atlas. |
| `name`, `version` | Full name and release. |
| `space` | Coordinate space of the data, for example `fsLR-32k`. |
| `license.name`, `license.url` | License or data use terms. |
| `license.local_use` | `true` if the terms allow using the files locally, `false` if they do not, `null` if not decided. |
| `license.copy_between_own_machines` | Whether you may copy the files between your own machines. Recorded for you; the build does not check it. |
| `license.redistribute` | Whether the files may be redistributed. Recorded for you; the build does not check it. |
| `license.attribution` | Required acknowledgement text. |
| `license.audited` | Date the terms were read and recorded. `null` means not audited. |
| `citation.text`, `citation.doi` | How to cite the source. |
| `acquisition` | How to obtain the file, `fetch` or `manual` (below). |

Check the manifest from `pipeline/`:

```bash
uv run menti-pipeline check-sources sources.yaml
```

`check-sources` validates the file and reports each source as `buildable` or `not buildable`, followed by every missing condition.

## When a source is built

The pipeline will build a source only when all three hold:

1. the license is audited (`license.audited` is set),
2. `license.local_use` is `true`,
3. a `sha256` checksum is recorded in `acquisition`.

Otherwise the build will stop with a message naming each missing condition. `copy_between_own_machines` and `redistribute` are not part of this rule.

## Fetch and manual sources

A `fetch` source has a `url` and a `sha256`. The pipeline will download the file and verify the checksum. Download and verification are not implemented yet.

A `manual` source cannot be downloaded automatically, usually because the provider requires you to accept data use terms first. Its entry has an `instructions_url`, the expected `filename` and a `sha256`. Download the file from the instructions page, accept the terms, and keep it under exactly that filename (a relative path). The pipeline will verify the checksum before using it.

An entry holds one file and one checksum. Sources that are several files or a folder (`fsaverage`, `dk`, `dkt`, `brodmann-fs-ba`, and `aseg-fsaverage`, which comes from the fsaverage folder) name one file for now. Do not record a checksum for them until the manifest supports a list of files, which comes with the first build stage; one checksum would leave the other files unverified. Where to place the file will be set when the download stage is implemented.

## What the data guard rejects

`scripts/check_no_data_files.py` runs in CI and checks every tracked file. It rejects:

- tracked symbolic links, whatever they point to,
- files with a data, mesh or archive suffix (for example `.nii`, `.nii.gz`, `.gii`, `.mgz`, `.annot`, `.glb`, `.npy`, `.csv`, `.tsv`, `.gz`, `.zip`, `.bin`, `.pial`), compared case-insensitively against the full suffix, and files whose content starts with gzip or zip bytes under any name,
- files larger than 1 MB,
- Git LFS pointers, and `.gitattributes` lines that set `filter=` or `working-tree-encoding=`, because the checked-out file would then differ from what git stores,
- tracked files that are missing or cannot be read,
- file names and text that match a leak pattern: participant identifiers (`NDAR`, an optional underscore, hyphen or space, and eight letters or digits, in any case, not preceded by a letter), and absolute home or cluster paths such as home directories (`/home/<user>`, `/Users/<user>`) and root-level cluster mounts (`orcd`, `scratch`, `net`, `mnt`, `nfs`, `gpfs`, `lustre`). Text is decoded leniently, so a stray non-UTF-8 byte does not hide a match, and text containing NUL bytes (UTF-16 or UTF-32) is scanned again with the NULs removed. The guard's own files are scanned too.

Run it locally:

```bash
python3.12 scripts/check_no_data_files.py
```

`scripts/data_guard_allow.txt` lists repo-relative paths that skip the size and leak checks. It cannot exempt a file from any other check. Keep real data in `$MENTI_DATA`.
