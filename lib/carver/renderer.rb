require 'ostruct'
require 'haml'
require 'redcarpet'

class Carver::Renderer

  attr_accessor :options

  def initialize(options={})
    self.options = OpenStruct.new options
  end

  def render
    input = read_template || "!=markdownContent"
    engine = template_engine.new input
    render_markdown
    engine.render Object.new, options.locales || {}
  end

  private

    def read_template
      return nil unless File.exist?("#{options.template}/index.html.haml")
      File::read("#{options.template}/index.html.haml")
    end

    def render_markdown
      return unless options.markdown_keywords
      markdown = markdown_engine
      options.markdown_keywords.each do |keyword|
        value = options.locales[keyword.to_sym] 
        options.locales[keyword.to_sym]  = markdown.render(value) if value
      end
    end

    def template_engine
      return options.template_engine || Haml::Engine
    end

    def markdown_engine
      renderer = Redcarpet::Render::HTML.new({})
      return options.markdown_engine || Redcarpet::Markdown.new(renderer, {})
    end

end

