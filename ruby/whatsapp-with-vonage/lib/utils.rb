def get_static_file(file_name)
    parent_directory = File.expand_path('..', __dir__)

    static_files_directory = File.join(parent_directory, 'static')

    full_file_path = File.join(static_files_directory, file_name)

    begin
        file_content = File.read(full_file_path)
        return file_content
    rescue StandardError => e
        raise "Error reading static file: #{e.message}"
    end
end

def throw_if_missing(data, keys)
    missing_keys = keys.select { |key| !data.key?(key) }

    if !missing_keys.empty?
        missing_keys_str = missing_keys.join(', ')
        raise "Missing required keys: #{missing_keys_str}"
    end
end