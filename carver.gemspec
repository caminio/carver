# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'carver/version'

Gem::Specification.new do |spec|
  spec.name          = "carver"
  spec.version       = Carver::VERSION
  spec.authors       = ["thorsten zerha","David Reinisch"]
  spec.email         = ["thorsten.zerha@tastenwerk.com", "david.reinisch@tastenwerk.com"]
  spec.summary       = %q{static site generator}
  spec.description   = %q{static site generator for caminio}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.6"
  spec.add_development_dependency "factory_girl"
  spec.add_development_dependency "rspec"
  spec.add_development_dependency "capybara"
  spec.add_development_dependency "factory_girl_rails"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "haml"
end
