require 'ostruct'
require 'fileutils'

class Carver::Writer
  attr_accessor :options

  def defaults
    { rel_public_path: "public" }
  end

  def initialize(options={})
    self.options = OpenStruct.new defaults.merge(options)
  end

  def write( content )
    File::write( dest_filename, content )
    dest_filename
  end

  private

  def dest_filename
    filename = File::join( options.cwd, options.rel_public_path, options.rel_filename )
    FileUtils::mkdir_p File::dirname( filename )
    filename
  end

end

