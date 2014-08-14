require 'rspec'
require 'factory_girl'
require 'rspec/expectations'
require 'fileutils'

require File::expand_path "../../lib/carver", __FILE__

RSpec.configure do |config|
  config.mock_with :rspec
  config.include FactoryGirl::Syntax::Methods
  config.color = true
  config.tty = true
  config.fail_fast = true
  config.formatter = :documentation # :progress, :html, :textmate
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
end

module CarverSpecHelper

  def self.root
    File::expand_path "../dummy/example_com", __FILE__
  end

  def self.clean
    FileUtils::rm_rf self.root
  end

end

CarverSpecHelper::clean
Carver::create_template CarverSpecHelper::root

# RSpec::Matchers.define :be_a_directory do |expected|
RSpec::Matchers.define :be_a_directory do
  match do |actual|
    File::directory? actual
  end
end

RSpec::Matchers.define :be_a_file do
  match do |actual|
    File::exists? actual
  end
end
