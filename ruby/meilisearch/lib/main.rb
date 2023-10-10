require 'appwrite'
require 'meilisearch'
require_relative 'config'

appwrite = Appwrite::Client.new
appwrite
  .set_endpoint(Config::APPWRITE_ENDPOINT)
  .set_project(Config::APPWRITE_FUNCTION_PROJECT_ID)
  .set_key(Config::APPWRITE_API_KEY)

meilisearch = MeiliSearch::Client.new(Config::MEILISEARCH_ENDPOINT, Config::MEILISEARCH_ADMIN_API_KEY)

index_name = Config::MEILISEARCH_INDEX_NAME

database = Appwrite::Database.new(appwrite)

index = meilisearch.index(index_name)

cursor = nil

begin
  queries = [Appwrite::Query.new.set_limit(100)]

  if cursor
    queries.push(Appwrite::Query.new.set_cursor(cursor))
  end

  documents = database.list_documents(
    Config::APPWRITE_DATABASE_ID,
    Config::APPWRITE_COLLECTION_ID,
    queries
  )

  if documents['documents'].length > 0
    cursor = documents['documents'].last['$id']
  else
    puts 'No more documents found.'
    cursor = nil
    break
  end

  puts "Syncing chunk of #{documents['documents'].length} documents ..."
  index.add_documents(documents['documents'], primary_key: '$id')
end while cursor

puts 'Sync finished.'
