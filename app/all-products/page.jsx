

'use client'
import { useState, useEffect, useMemo, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};


const SearchFocus = ({ searchInputRef }) => {
    const searchParams = useSearchParams();
    const focus = searchParams.get('focus');

    useEffect(() => {
        if (focus === 'search' && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [focus, searchInputRef]);

    return null;
}

const AllProducts = () => {
    const { products, currency } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchInputRef = useRef(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedPriceRange = useDebounce(priceRange, 500);

    const categories = useMemo(() => {
        const allCategories = products.map(p => p.category);
        return [...new Set(allCategories)];
    }, [products]);

    const handleCategoryChange = (category) => {
        setCategoryFilter(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        // Search term filter
        if (debouncedSearchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter.length > 0) {
            filtered = filtered.filter(p => categoryFilter.includes(p.category));
        }

        // Price range filter
        filtered = filtered.filter(p => {
            const price = p.flashSalePrice > 0 && new Date(p.flashSaleEndDate) > new Date() ? p.flashSalePrice : p.offerPrice;
            const minPrice = debouncedPriceRange.min !== '' ? parseFloat(debouncedPriceRange.min) : 0;
            const maxPrice = debouncedPriceRange.max !== '' ? parseFloat(debouncedPriceRange.max) : Infinity;
            return price >= minPrice && price <= maxPrice;
        });

        // Sorting
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.offerPrice - b.offerPrice);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.offerPrice - a.offerPrice);
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }

        return filtered;
    }, [products, debouncedSearchTerm, categoryFilter, debouncedPriceRange, sortBy]);
    
    const resetFilters = () => {
        setSearchTerm('');
        setCategoryFilter([]);
        setPriceRange({ min: '', max: '' });
        setSortBy('newest');
    };

    const PriceInput = ({ value, onChange, onEnter }) => {
        const [inputValue, setInputValue] = useState(value);
    
        useEffect(() => {
            setInputValue(value);
        }, [value]);
    
        const handleBlur = () => {
            onChange(inputValue);
        };
    
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                onChange(inputValue);
                e.target.blur();
                if (onEnter) onEnter();
            }
        };
    
        return (
            <input
                type="tel"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.]/g, ''))}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full pl-7 pr-2 py-2 border rounded-md text-sm"
            />
        );
    };

    const FilterSidebar = () => (
        <div className="lg:w-64 xl:w-72 space-y-6">
            {/* Sort By */}
            <div>
                <h3 className="font-semibold mb-2">Sort by</h3>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border rounded-md text-sm">
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                </select>
            </div>
            {/* Price Range */}
            <div>
                <h3 className="font-semibold mb-2">Price Range</h3>
                 <div className="flex items-center gap-2">
                    <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-gray-500">{currency}</span>
                        <PriceInput
                            value={priceRange.min}
                            onChange={(val) => setPriceRange(prev => ({ ...prev, min: val }))}
                            onEnter={() => setIsFilterOpen(false)}
                        />
                    </div>
                    <span className="text-gray-500">-</span>
                     <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-gray-500">{currency}</span>
                         <PriceInput
                            value={priceRange.max}
                            onChange={(val) => setPriceRange(prev => ({ ...prev, max: val }))}
                            onEnter={() => setIsFilterOpen(false)}
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-semibold mb-2">Categories</h3>
                <div className="space-y-2">
                    {categories.map(cat => (
                        <label key={cat} className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={categoryFilter.includes(cat)}
                                onChange={() => handleCategoryChange(cat)}
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-2 text-gray-700">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>
             
             {/* Reset Button */}
            <div>
                 <button onClick={resetFilters} className="w-full mt-4 text-sm text-center py-2 border rounded-md hover:bg-gray-100">
                    Reset Filters
                </button>
            </div>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="flex flex-col px-6 md:px-16 lg:px-32 pt-20">
                <SearchFocus searchInputRef={searchInputRef} />
                <div className="flex flex-col items-end pt-12">
                    <p className="text-2xl font-medium">All products</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>

                <div className="relative w-full my-8">
                     <div className="relative w-full">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search for products..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Image
                            src={assets.search_icon}
                            alt="search icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <button onClick={() => setIsFilterOpen(true)} className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-100">
                           <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-8 w-full pb-14">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block">
                        <FilterSidebar />
                    </aside>
                    
                    {/* Mobile Sidebar */}
                     {isFilterOpen && (
                        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)}></div>
                    )}
                    <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg p-6 transform transition-transform z-50 lg:hidden ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{width: '80%', maxWidth: '300px'}}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)}>
                                <X />
                            </button>
                        </div>
                        <FilterSidebar />
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-6 w-full">
                            {filteredAndSortedProducts.length > 0 ? (
                                filteredAndSortedProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500">No products found.</p>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
