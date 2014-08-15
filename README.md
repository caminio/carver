# Carver

a static site generator for ruby

carver is designed to interoperate with a bigger framework (especially RoR)
capable of inserting objects/records into all kinds of template engines

## Usage

    require 'carver'
    carver = Carver::init "/path/to/template/dir"

compile all files found in template directory

    carver.compile

compile static templates (with no need of further object logic)

    carver.compile "home"
    # expects /path/to/template/dir/views/home/index.<template_engine>.html to exist


register a template engine    

    require 'haml'
    carver.template_engine = Haml::Engine


register a markdown compiler

    markdown = Redcarpet::Markdown.new(renderer, extensions = {})
    carver.markdown_engine = markdown

register a parser engine

    def your_engine( parameters ) 
      return "replaced content"
    end

    carver.register_parser( "keyword", your_engine )


## Installation

Add this line to your application's Gemfile:

    gem 'carver'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install carver

## Usage

TODO: Write usage instructions here

## Contributing

1. Fork it ( https://github.com/[my-github-username]/carver/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
