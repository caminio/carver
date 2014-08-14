require 'spec_helper'

describe Carver::Writer do

  let(:template_file){ File::join CarverSpecHelper::root, "views", "home" }
  let(:renderer){ Carver::Renderer.new template: template_file;  }
  let(:writer){ Carver::Writer.new cwd: CarverSpecHelper::root, rel_filename: "home.html" }

  context "renders a template" do

    before(:each) do
      writer.write renderer.render
    end

    context "html output in file" do

      let(:filename){ File::join( CarverSpecHelper::root, "public", "home.html") }

      it { expect( filename ).to be_a_file }
      it { expect( File::read(filename) ).to eq("<h1>test</h1>\n") }

    end

  end

end
