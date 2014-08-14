require 'spec_helper'

describe Carver do

  context "create template in #{CarverSpecHelper::root}" do

    it { expect( CarverSpecHelper::root ).to be_a_directory }

    context "site.yml" do
      it { expect( File::join( CarverSpecHelper::root, "config", "site.yml" )).to be_a_file }
    end

  end

end
