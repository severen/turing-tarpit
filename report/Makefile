# SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
# SPDX-License-Identifier: CC0-1.0

.PHONY: report.pdf presentation.pdf all watch clean

all: report.pdf presentation.pdf

report.pdf: report.tex
	latexmk -lualatex -use-make -f -quiet -interaction=nonstopmode $(PREVIEW_CONTINUOUSLY) report.tex

presentation.pdf: presentation.tex
	latexmk -lualatex -use-make -f -quiet -interaction=nonstopmode $(PREVIEW_CONTINUOUSLY) presentation.tex

watch: PREVIEW_CONTINUOUSLY=-pvc -view=none
watch: report.pdf presentation.pdf

clean:
	latexmk -CA
