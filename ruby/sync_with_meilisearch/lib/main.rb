require 'appwrite'
require 'meilisearch'
require_relative 'utils'

def main(context)
  throw_if_missing(ENV, [
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'MEILISEARCH_ENDPOINT',
    'MEILISEARCH_INDEX_NAME',
    'MEILISEARCH_ADMIN_API_KEY',
    'MEILISEARCH_SEARCH_API_KEY'
  ])

  if context.req.method == 'GET'
    html = interpolate(get_static_file('index.html'), {
      'MEILISEARCH_ENDPOINT' => ENV['MEILISEARCH_ENDPOINT'],
      'MEILISEARCH_INDEX_NAME' => ENV['MEILISEARCH_INDEX_NAME'],
      'MEILISEARCH_SEARCH_API_KEY' => ENV['MEILISEARCH_SEARCH_API_KEY']
    })

    return context.res.text(html, 200, { 'Content-Type' => 'text/html; charset=utf-8' })
  end

  client = Appwrite::Client.new
  client
    .set_endpoint(ENV['APPWRITE_FUNCTION_API_ENDPOINT'])
    .set_project(ENV['APPWRITE_FUNCTION_PROJECT_ID'])
    .set_key(context.req.headers["x-appwrite-key"])

  databases = Appwrite::Databases.new(client)

  meilisearch = MeiliSearch::Client.new(ENV['MEILISEARCH_ENDPOINT'], ENV['MEILISEARCH_ADMIN_API_KEY'])

  index_name = ENV['MEILISEARCH_INDEX_NAME']

  database = Appwrite::Database.new(client)

  index = meilisearch.index(index_name)

  cursor = nil

  begin
    queries = [Appwrite::Query.new.set_limit(100)]

    if cursor
      queries.push(Appwrite::Query.new.set_cursor(cursor))
    end

    documents = database.list_documents(
      ENV['APPWRITE_DATABASE_ID'],
      ENV['APPWRITE_COLLECTION_ID'],
      queries
    )

    if documents['documents'].length > 0
      cursor = documents['documents'].last['$id']
    else
      context.error('No more documents found.')
      cursor = nil
      break
    end

    context.log("Syncing chunk of #{documents['documents'].length} documents ...")
    index.add_documents(documents['documents'], primary_key: '$id')
  end while cursor

  context.log('Sync finished.')

  return context.res.text('Sync finished.', 200)
end