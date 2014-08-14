require 'fileutils'

module Carver

  def self.create_template( dest )
    Dir.mkdir dest unless File::exists? dest
    src = File::expand_path "../templates/", __FILE__
    FileUtils::cp_r "#{src}/.", dest
  end

end
