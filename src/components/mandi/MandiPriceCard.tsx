import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, IndianRupee, Calendar, RefreshCw, Search, Loader2, Wheat, MapPin, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Loading';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface MandiPrice {
    commodity: string;
    variety?: string;
    market: string;
    state?: string;
    district?: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    arrivalDate?: string;
    unit?: string;
}

interface MandiPriceCardProps {
    prices?: MandiPrice[];
    lastUpdated?: string;
    isLoading?: boolean;
    error?: Error | null;
    onSearch?: (commodity: string, market?: string) => void;
    location?: string;
}

// Popular crops for quick selection
const popularCrops = ['Rice', 'Wheat', 'Onion', 'Tomato', 'Potato', 'Cotton', 'Maize', 'Groundnut'];

// Popular markets/places
const popularPlaces = ['Chennai', 'Salem', 'Coimbatore', 'Mumbai', 'Delhi', 'Hyderabad', 'Bangalore', 'Kolkata'];

export function MandiPriceCard({
    prices,
    lastUpdated,
    isLoading,
    error,
    onSearch,
    location,
}: MandiPriceCardProps) {
    const { t } = useLanguage();
    const [cropInput, setCropInput] = useState('');
    const [placeInput, setPlaceInput] = useState(location || '');
    const [isSearching, setIsSearching] = useState(false);
    const [searchedCrop, setSearchedCrop] = useState('');
    const [searchedPlace, setSearchedPlace] = useState('');

    const handleSearch = async () => {
        if (!cropInput.trim()) return;

        setIsSearching(true);
        setSearchedCrop(cropInput.trim());
        setSearchedPlace(placeInput.trim() || 'All India');

        try {
            onSearch?.(cropInput.trim(), placeInput.trim() || undefined);
        } finally {
            setTimeout(() => setIsSearching(false), 500);
        }
    };

    const handleQuickCrop = (crop: string) => {
        setCropInput(crop);
    };

    const handleQuickPlace = (place: string) => {
        setPlaceInput(place);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    if (isLoading && !prices?.length) {
        return <MandiPriceCardSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-slate-800">{t('dashboard.mandi.title')}</span>
                        </div>
                        <Badge variant="info" size="sm">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Live Data
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Search Section */}
                    <div className="mb-5 p-4 bg-white/70 rounded-xl border border-purple-100">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Search className="w-4 h-4 text-purple-500" />
                            Search Mandi Prices
                        </h4>

                        {/* Crop Input */}
                        <div className="mb-3">
                            <label className="text-xs text-slate-500 mb-1.5 block">Crop Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cropInput}
                                    onChange={(e) => setCropInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter crop (Rice, Wheat, Onion, etc.)"
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-white text-slate-700 placeholder-slate-400 font-medium border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                />
                                <Wheat className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {popularCrops.map((crop) => (
                                    <button
                                        key={crop}
                                        onClick={() => handleQuickCrop(crop)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${cropInput === crop
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                            }`}
                                    >
                                        {crop}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Place/Market Input */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-500 mb-1.5 block">Market/Place (City, District, or Town)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={placeInput}
                                    onChange={(e) => setPlaceInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter place (Chennai, Salem, Coimbatore, etc.)"
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-white text-slate-700 placeholder-slate-400 font-medium border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                />
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {popularPlaces.map((place) => (
                                    <button
                                        key={place}
                                        onClick={() => handleQuickPlace(place)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${placeInput === place
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                                            }`}
                                    >
                                        {place}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching || !cropInput.trim()}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 py-3 shadow-lg font-semibold"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Fetching Prices...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5 mr-2" />
                                    Search Mandi Prices
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Current search info */}
                    {searchedCrop && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl text-sm text-purple-700 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Wheat className="w-4 h-4" />
                                <span>
                                    <span className="font-bold">{searchedCrop}</span>
                                    {searchedPlace !== 'All India' && (
                                        <span className="text-purple-500"> in {searchedPlace}</span>
                                    )}
                                </span>
                            </div>
                            <button
                                onClick={() => { setSearchedCrop(''); setSearchedPlace(''); }}
                                className="text-purple-400 hover:text-purple-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {error || !prices?.length ? (
                        <div className="text-center py-10 bg-white/40 rounded-xl">
                            <IndianRupee className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium mb-1">
                                {searchedCrop
                                    ? `No prices found for "${searchedCrop}"${searchedPlace !== 'All India' ? ` in ${searchedPlace}` : ''}`
                                    : 'Search for crop prices'}
                            </p>
                            <p className="text-slate-400 text-sm">
                                {searchedCrop
                                    ? 'Try a different crop or location'
                                    : 'Enter a crop name and location to see live mandi prices'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Results count */}
                            <div className="mb-3 text-sm text-slate-600 font-medium">
                                Found {prices.length} price entries
                            </div>

                            {/* Price Cards Grid */}
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {prices.slice(0, 10).map((price, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="bg-white rounded-xl p-4 border border-purple-100 hover:shadow-lg hover:border-purple-200 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-base">
                                                    {price.commodity}
                                                </h4>
                                                {price.variety && (
                                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                        {price.variety}
                                                    </span>
                                                )}
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                                                    {price.market}
                                                </p>
                                            </div>
                                            {price.state && (
                                                <Badge variant="default" size="sm" className="text-xs bg-purple-100 text-purple-700">
                                                    {price.state}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                                <div className="text-[10px] text-green-600 uppercase font-medium">Min Price</div>
                                                <div className="font-bold text-green-700 text-lg">
                                                    ₹{price.minPrice.toLocaleString()}
                                                </div>
                                                <div className="text-[9px] text-green-500">/quintal</div>
                                            </div>

                                            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                                                <div className="text-[10px] text-purple-600 uppercase font-medium">Modal Price</div>
                                                <div className="font-bold text-purple-700 text-xl">
                                                    ₹{price.modalPrice.toLocaleString()}
                                                </div>
                                                <div className="text-[9px] text-purple-500">/quintal</div>
                                            </div>

                                            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100">
                                                <div className="text-[10px] text-red-600 uppercase font-medium">Max Price</div>
                                                <div className="font-bold text-red-700 text-lg">
                                                    ₹{price.maxPrice.toLocaleString()}
                                                </div>
                                                <div className="text-[9px] text-red-500">/quintal</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Last updated */}
                            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-purple-100">
                                <span className="bg-purple-100 px-3 py-1.5 rounded-full font-medium">
                                    {prices.length} results
                                </span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Just now'}</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function MandiPriceCardSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-32" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full mb-4 rounded-xl" />
                <Skeleton className="h-32 w-full mb-4 rounded-xl" />
                <Skeleton className="h-4 w-40" />
            </CardContent>
        </Card>
    );
}
