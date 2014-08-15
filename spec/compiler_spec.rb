require 'spec_helper'

describe Carver::Compiler do

  let(:carver){ Carver::Compiler.new CarverSpecHelper::root }

  context "compiles a template file" do

    let(:result){ carver.compile "home" }

    it { expect( result ).to be_a_file }
    it { expect( File::read(result) ).to eq("<h1>test</h1>\n") }

  end

  context "compiles a template directory" do

    let(:result){ carver.compile }

    it { puts result }
  end

  context "can register a markdown compiler" do

    it "redcarpet is default"

    it "is called via .render"

  end

  context "can register a layout compiler" do

    it "haml is default"

    it "is called via .render"

  end

end
