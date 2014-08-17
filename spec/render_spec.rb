require 'spec_helper'

describe Carver::Renderer do

  let(:template_file){ File::join CarverSpecHelper::root, "views", "home" }
  let(:carver){ Carver::Renderer.new template: template_file, locales: { item: "test", markdownContent: "# markdown" }, markdown_keywords: ["markdownContent"] } 

  context "renders a template" do

    let!(:result){ carver.render }

    context "html output as string" do

      it { expect( result ).to eq("<h1>test</h1>\n") }

    end

  end

  
  context "uses a markdown engine" do

    let(:template_file){ File::join CarverSpecHelper::root, "views", "markdown" }
    let(:carver){ Carver::Renderer.new template: template_file, locales: { item: "test", markdownContent: "# markdown" }, markdown_keywords: ["markdownContent"] } 
    let!(:result){ carver.render }

    context "html output as string" do

      it { expect( result ).to eq("<h1>markdown</h1>\n") }

    end

    context "uses !=markdownContent as default" do
      

    end

  end

end
