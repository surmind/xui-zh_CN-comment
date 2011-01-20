OLD_VERSION=2.0.0
VERSION=2.0.1

default: clean version build test

clean:
	rm ./lib/*

version:
	sed -i "" 's/$(OLD_VERSION)/$(VERSION)/' ./util/profiles/ie.js
	sed -i "" 's/$(OLD_VERSION)/$(VERSION)/' ./util/profiles/bb.js
	sed -i "" 's/$(OLD_VERSION)/$(VERSION)/' ./util/profiles/core.js
	sed -i "" 's/$(OLD_VERSION)/$(VERSION)/' ./spec/index.html
	sed -i "" 's/$(OLD_VERSION)/$(VERSION)/' ./spec/index-ie.html
	sed -i "" 's/$(OLD_VERSION)/$(VERSION)/' ./spec/index-bb.html

build:
	./util/build profile=core --minify
	./util/build profile=bb --minify
	./util/build profile=ie --minify

doc:
	./util/build --generate-docs

test:
	open ./spec/index.html

.PHONY: default clean version build doc test	
