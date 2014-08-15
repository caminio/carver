require 'ostruct'
class Carver::Compiler

  attr_accessor :options

  def defaults
    {}
  end

  def initialize( cwd )
    self.options = OpenStruct.new defaults.merge({ cwd: cwd })
  end

  def compile template_or_object = nil
    if !template_or_object
      compile_template_directory
    elsif template_or_object.is_a?(String)
      compile_template_file(template_or_object)
    else
      compile_object(template_or_object)
    end
  end

  private

    def compile_template_directory
      puts "TODO"
      puts Dir.entries(options.cwd)
    end

    def compile_template_file template_name
      renderer = Carver::Renderer.new template: File::join( options.cwd, "views", template_name )
      writer = Carver::Writer.new cwd: options.cwd, rel_filename: "home.html"
      puts "here #{options.cwd}"
      writer.write renderer.render 
    end

    def compile_object object
      puts "TODO"
    end


end
