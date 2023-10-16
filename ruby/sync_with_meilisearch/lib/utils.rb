require 'pathname'

def throw_if_missing(hash, keys)
  missing = keys.select { |key| !hash.key?(key) || hash[key].nil? }
  raise "Missing required fields: #{missing.join(', ')}" if missing.any?
end

def get_static_file(file_name)
  static_folder = File.join(File.dirname(__FILE__), '../static')
  File.read(File.join(static_folder, file_name))
end

def interpolate(template, values)
  template.gsub(/{{([^}]+)}}/) { |match| values[match[2..-3].strip] || match }
end
