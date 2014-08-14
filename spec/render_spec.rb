require 'spec_helper'

describe Carver::Renderer do

  let(:template_file){ File::join CarverSpecHelper::root, "views", "home" }
  let(:carver){ Carver::Renderer.new template: template_file }

  context "renders a template" do

    let!(:result){ carver.render }

    context "html output as string" do

      it { expect( result ).to eq("<h1>test</h1>\n") }

    end

  end

end
