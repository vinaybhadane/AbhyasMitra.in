'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { searchPosts } from '@/lib/firestore';
import { Post } from '@/lib/types';
import BlogCard from '@/components/BlogCard';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [q]);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchPosts(term);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('q', query.trim());
    window.history.pushState(null, '', `/search?${params.toString()}`);
    doSearch(query.trim());
  };

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative mb-10">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, subjects, topics..."
          className="w-full pl-14 pr-14 py-4 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : searched ? (
        results.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Found <strong>{results.length}</strong> results for &quot;{q}&quot;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Results Found</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Try searching with different keywords like subject name or topic.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Start typing to search notes</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
          Search Notes
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Find study material for SPPU 2024 Pattern engineering subjects
        </p>
      </div>
      <Suspense fallback={<div className="skeleton h-16 w-full rounded-2xl" />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
