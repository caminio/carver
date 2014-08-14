require 'ostruct'
require 'haml'

class Carver::Renderer
  attr_accessor :options

  def initialize(options={})
    self.options = OpenStruct.new options
  end

  def render
    input = read_template
    engine = Haml::Engine.new input
    engine.render Object.new, item: 'test'
  end

  private

  def read_template
    File::read("#{options.template}/index.html.haml")
  end

end

