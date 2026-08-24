package io.openruntimes.java.src;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

public class Utils {
    /**
     * Returns the contents of a file in the static folder
     *
     * @param fileName The name of the file
     * @return Contents of static/{fileName}
     * @throws IOException If an I/O error occurs reading from the file
     */
    public static String getStaticFile(String fileName) throws IOException {
        Path staticFolder = Paths.get("../static/");
        Path filePath = staticFolder.resolve(fileName);
        List<String> lines = Files.readAllLines(filePath);
        return String.join("\n", lines);
    }

    /**
     * Throws an error if any of the keys are missing from the map
     *
     * @param map  The map to check for missing keys
     * @param keys The array of keys to check for
     * @throws Exception If any required fields are missing
     */
    public static void throw_if_missing(Map<String, ?> map, String[] keys) throws Exception {
        List<String> missing = new ArrayList<String>();
        for (String key : keys) {
            if (!map.containsKey(key) || map.get(key) == null) {
                missing.add(key);
            }
        }
        if(missing.size() > 0){
            throw new Exception("Missing required fields: "+String.join(", ", missing));
        }
    }
}
