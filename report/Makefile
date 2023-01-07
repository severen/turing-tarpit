# SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
# SPDX-License-Identifier: CC0-1.0

.PHONY: report.pdf all watch clean

all: report.pdf

report.pdf: report.tex
	latexmk -lualatex -use-make -f -quiet -interaction=nonstopmode -shell-escape $(PREVIEW_CONTINUOUSLY) report.tex

watch: PREVIEW_CONTINUOUSLY=-pvc -view=none
watch: report.pdf

clean:
	latexmk -CA
