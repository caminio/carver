require 'ostruct'
require 'haml'

class Carver::Renderer

  attr_accessor :options

  def initialize(options={})
    self.options = OpenStruct.new options
  end

  def render
    input = read_template
    engine = template_engine.new input
    engine.render Object.new, item: 'test'
  end

  private

  def read_template
    File::read("#{options.template}/index.html.haml")
  end

  def template_engine
    return options.template_engine || Haml::Engine
  end

  def markdown_engine
    return options.markdown_engine || Redcarpet::Markdown.new({}, {})
  end

end

