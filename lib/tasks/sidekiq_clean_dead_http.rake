# lib/tasks/sidekiq_clean_dead_http.rake

namespace :sidekiq do
  desc "Clean up dead jobs for specific workers and error classes"
  task clean_dead_http: :environment do
    dead_jobs = Sidekiq::DeadSet.new.select do |job|
      (job.display_class == "ActivityPub::ProcessingWorker" || job.display_class == "ActivityPub::SynchronizeFeaturedCollectionWorker" || job.display_class == "ThreadResolveWorker" || job.display_class == "FetchReplyWorker" || job.display_class == "RedownloadMediaWorker" || job.display_class == "RedownloadHeaderWorker") &&
      job['error_class'] =~ /HTTP::ConnectionError|HTTP::TimeoutError|OpenSSL::SSL::SSLError/
    end

    puts "Found #{dead_jobs.size} matching dead jobs."

    dead_jobs.each(&:delete)

    puts "Deleted #{dead_jobs.size} dead jobs."
  end
end