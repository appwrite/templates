# Gets the content of a static file located in the 'static' directory.
# @param [String] file_name The name of the static file to retrieve.
# @return [String] The content of the static file.
# @raise [StandardError] If there is an error reading the file.
def get_static_file(file_name)
    full_file_path = File.expand_path(File.join('../static', file_name), __dir__)

    begin
        return File.read(full_file_path)
    rescue StandardError => e
        raise "Error reading static file: #{e.message}"
    end
end

# Throws an error if any of the keys are missing from the data hash.
# @param [Hash] data The hash containing key-value pairs.
# @param [Array<String>] keys An array of keys to check for in the data hash.
# @raise [StandardError] If any of the required keys are missing.
def throw_if_missing(data, keys)
    missing_keys = keys.select { |key| !data.key?(key) }

    if !missing_keys.empty?
        missing_keys_str = missing_keys.join(', ')
        raise "Missing required keys: #{missing_keys_str}"
    end
end