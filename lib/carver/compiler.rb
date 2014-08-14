require 'ostruct'
class Carver::Compiler

  attr_accessor :options

  def defaults
    {}
  end

  def initialize( cwd )
    self.options = OpenStruct.new defaults.merge({ cwd: cwd })
  end

  def compile( template_name )
    renderer = Carver::Renderer.new template: File::join( options.cwd, "views", template_name )
    writer = Carver::Writer.new cwd: options.cwd, rel_filename: "home.html"
    puts "here #{options.cwd}"
    writer.write renderer.render 
  end

end
