import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import PhotoCard from './PhotoCard';
import type { Photo } from './PhotoCard';

const PAGE_SIZE = 20;

// Grid view for displaying a paginated, infinite-scroll list of photos
const PhotoGrid: React.FC = () => {
	// State for photos, pagination, loading, error, and infinite scroll
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const loader = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();

	// Fetch photos for the current page
	const fetchPhotos = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${PAGE_SIZE}`);
			if (!res.ok) throw new Error('Failed to fetch photos');
			const data: Photo[] = await res.json();
			setPhotos((prev) => {
				// Filter out already loaded photos by id
				const existingIds = new Set(prev.map((p) => p.id));
				const newPhotos = data.filter((photo) => !existingIds.has(photo.id));
				return [...prev, ...newPhotos];
			});
			setHasMore(data.length === PAGE_SIZE);
		} catch (err: any) {
			setError(err.message || 'Unknown error');
		} finally {
			setLoading(false);
		}
	}, [page]);

	// Fetch photos when page changes
	useEffect(() => {
		fetchPhotos();
	}, [fetchPhotos]);

	// Infinite scroll: load more when loader is visible
	useEffect(() => {
		if (!hasMore || loading) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setPage((prev) => prev + 1);
				}
			},
			{ threshold: 1 }
		);
		if (loader.current) observer.observe(loader.current);
		return () => {
			if (loader.current) observer.unobserve(loader.current);
		};
	}, [hasMore, loading]);

	return (
		<div className="min-h-screen bg-white pb-12 animate-gradient-x">
			<Header />
			<div className="w-full px-5">
				{/* Responsive photo grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
					{photos.map((photo) => (
						<div className="transition-transform duration-300 hover:scale-105" key={photo.id}>
							<PhotoCard photo={photo} onClick={() => navigate(`/photos/${photo.id}`)} />
						</div>
					))}
				</div>
				{/* Error message */}
				{error && <div className="text-red-500 mt-8 text-center font-semibold text-lg shadow rounded-lg bg-white/80 py-2 px-4">{error}</div>}
				{/* Loading spinner */}
				{loading && (
					<div className="flex flex-col items-center mt-8">
						<span className="inline-block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
						<span className="mt-3 text-blue-500 font-semibold text-lg animate-pulse">Loading...</span>
					</div>
				)}
				{/* No more photos message */}
				{!hasMore && !loading && (
					<div className="text-center text-gray-500 mt-8 font-medium text-lg">No more photos to load.</div>
				)}
				{/* Loader for infinite scroll */}
				<div ref={loader} />
			</div>
		</div>
	);
};

export default PhotoGrid;
