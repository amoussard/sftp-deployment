SRC = lib
TESTS = spec/*Spec.js
REPORTER = spec
COVERAGE_REPORT = ./coverage/lcov.info
COVERALLS = ./node_modules/coveralls/bin/coveralls.js

test: test-mocha

test-mocha:
	@NODE_ENV=test mocha \
	    --timeout 200 \
		--reporter $(REPORTER) \
		$(TESTS)

test-cov: istanbul

istanbul:
	istanbul cover _mocha -- -R spec --recursive $(SRC) $(TESTS)

coveralls:
	cat $(COVERAGE_REPORT) | $(COVERALLS)

clean:
	rm -rf ./coverage
