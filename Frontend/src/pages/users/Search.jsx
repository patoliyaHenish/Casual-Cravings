  import {
    Search as SearchIcon,
    Share as ShareIcon,
    AccessTime as TimeIcon
  } from '@mui/icons-material';
  import {
    Alert,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Typography
  } from '@mui/material';
  import React, { useCallback, useEffect, useRef, useState } from 'react';
  import { useSearchParams } from 'react-router-dom';
  import { useGetSearchSuggestionsQuery, useSearchRecipesQuery } from '../../features/api/searchApi';
  import RecipeGridSkeleton from '../../components/common/RecipeGridSkeleton';
  import { useTheme } from '../../context/ThemeContext';

  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 640);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
  }

  const Search = () => {
    const { isDarkMode } = useTheme();
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);
    const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [filters, setFilters] = useState({
      category: searchParams.get('category') || '',
      subCategory: searchParams.get('subCategory') || '',
      prepTime: searchParams.get('prepTime') || null,
      cookTime: searchParams.get('cookTime') || null,
      servingSize: searchParams.get('servingSize') || null,
    });
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [allRecipes, setAllRecipes] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const processedDataRef = useRef(new Set());
    const scrollContainerRef = useRef();
    const isMobile = useIsMobile();
    const searchBoxRef = useRef(null);

    const searchParamsForApi = {
      q: searchQuery,
      ...filters,
      page,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    };

    const { data: searchData, isLoading: searchLoading, error: searchError } = useSearchRecipesQuery(searchParamsForApi, {
      skip: false,
      refetchOnMountOrArgChange: true
    });


    const { data: suggestionsDataRaw } = useGetSearchSuggestionsQuery(searchQuery, {
      skip: searchQuery.length > 0 && searchQuery.length < 2
    });

    let suggestionsData = suggestionsDataRaw
      ? { ...suggestionsDataRaw }
      : { suggestions: [], popularSearches: [] };

    if (suggestionsData && suggestionsData.popularSearches) {
      suggestionsData.popularSearches = [
        ...suggestionsData.popularSearches,
      ];
    }

    const shouldShowSuggestions =
      searchQuery.length > 0 &&
      suggestionsData &&
      (suggestionsData.suggestions?.length > 0 || suggestionsData.popularSearches?.length > 0);

    const lastRecipeElementRef = useCallback(node => {
      if (searchLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new window.IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting && hasMore && !searchLoading) {
            setPage(prevPage => prevPage + 1);
          }
        },
        {
          threshold: 0.1,
          rootMargin: '100px',
          root: null
        }
      );

      if (node) observer.current.observe(node);
    }, [searchLoading, hasMore]);

    useEffect(() => {
      return () => {
        if (observer.current) observer.current.disconnect();
      };
    }, []);

    useEffect(() => {
      if (searchData) {
        const dataKey = `${page}-${searchData.recipes?.length || 0}`;
        if (processedDataRef.current.has(dataKey)) {
          return;
        }
        processedDataRef.current.add(dataKey);
        if (page === 1) {
          setAllRecipes(searchData.recipes || []);
          processedDataRef.current.clear();
          processedDataRef.current.add(dataKey);
        } else {
          setAllRecipes(prev => {
            const existingIds = new Set(prev.map(recipe => recipe.id));
            const newRecipes = searchData.recipes || [];
            const uniqueNewRecipes = newRecipes.filter(recipe => !existingIds.has(recipe.id));
            const combinedRecipes = [...prev, ...uniqueNewRecipes];
            return combinedRecipes;
          });
        }
        const hasMorePages = searchData.pagination?.currentPage < searchData.pagination?.totalPages;
        setHasMore(hasMorePages);
      }
    }, [searchData, page]);

    const handleSearch = (query) => {
      if (query.trim()) {
        setSearchQuery(query);
        setPage(1);
        setAllRecipes([]);
        setHasMore(true);
        updateSearchParams({ q: query, page: 1 });
        setShowAllSuggestions(false);
        setShowSuggestionsDropdown(false);
      }
    };

    const handleClearSearch = () => {
      setSearchQuery('');
      setPage(1);
      setAllRecipes([]);
      setHasMore(true);
      setFilters({
        category: '',
        subCategory: '',
        prepTime: null,
        cookTime: null,
        servingSize: null,
      });
      setSearchParams({});
      setShowAllSuggestions(false);
      setShowSuggestionsDropdown(false);
    };

    const updateSearchParams = (newParams) => {
      const currentParams = Object.fromEntries(searchParams.entries());
      const updatedParams = { ...currentParams, ...newParams };

      Object.keys(updatedParams).forEach(key => {
        if (!updatedParams[key] || updatedParams[key] === '') {
          delete updatedParams[key];
        }
      });

      setSearchParams(updatedParams);
    };

    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        handleSearch(searchQuery);
      }
    };

    const formatTime = (minutes) => {
      if (minutes < 60) {
        return `${minutes} m`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}.${mins} h` : `${hours} h`;
    };

    useEffect(() => {
      const query = searchParams.get('q');
      const category = searchParams.get('category');
      const subCategory = searchParams.get('subCategory');
      const prepTime = searchParams.get('prepTime');
      const cookTime = searchParams.get('cookTime');
      const servingSize = searchParams.get('servingSize');
      const pageParam = searchParams.get('page');

      if (query) setSearchQuery(query);
      if (category) setFilters(prev => ({ ...prev, category }));
      if (subCategory) setFilters(prev => ({ ...prev, subCategory }));
      if (prepTime) setFilters(prev => ({ ...prev, prepTime: parseInt(prepTime) }));
      if (cookTime) setFilters(prev => ({ ...prev, cookTime: parseInt(cookTime) }));
      if (servingSize) setFilters(prev => ({ ...prev, servingSize: parseInt(servingSize) }));
      if (pageParam) setPage(parseInt(pageParam));
    }, [searchParams]);

    useEffect(() => {
      document.body.classList.add('custom-scrollbar');
      return () => {
        document.body.classList.remove('custom-scrollbar');
      };
    }, []);

    useEffect(() => {
      function handleClickOutside(event) {
        if (
          searchBoxRef.current &&
          !searchBoxRef.current.contains(event.target)
        ) {
          setShowSuggestionsDropdown(false);
        }
      }
      if (showSuggestionsDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showSuggestionsDropdown]);

    const combinedSuggestions = [];
    const seen = new Set();

    if (suggestionsData?.suggestions) {
      suggestionsData.suggestions.forEach(s => {
        if (!seen.has(s.text)) {
          combinedSuggestions.push({ ...s, source: 'suggestion' });
          seen.add(s.text);
        }
      });
    }
    if (suggestionsData?.popularSearches) {
      suggestionsData.popularSearches.forEach(keyword => {
        if (!seen.has(keyword)) {
          combinedSuggestions.push({ type: 'popular', text: keyword, source: 'popular' });
          seen.add(keyword);
        }
      });
    }

    const handleInputFocus = () => {
      if (shouldShowSuggestions) {
        setShowSuggestionsDropdown(true);
      }
    };

    return (
      <div
        className="min-h-screen pt-[56px] sm:pt-[64px]"
        style={{
          backgroundColor: isDarkMode ? 'var(--bg-primary)' : '#f9fafb',
          transition: 'background-color 0.3s ease'
        }}
      >
        <div
          className="w-full pt-8 sm:pt-10 pb-4 sm:pb-6"
          style={{
            backgroundColor: isDarkMode ? '#000000' : '#000000',
            transition: 'background-color 0.3s ease'
          }}
        >
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-4">
            <div className="relative max-w-2xl mx-auto w-full" ref={searchBoxRef}>
              <div className={`flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-[#a21caf] transition ${
                isMobile ? 'px-3 py-3 h-12' : 'px-4 py-2'
              }`} style={{ minHeight: isMobile ? '48px' : 'auto' }}>
                <SearchIcon className={`text-gray-400 dark:text-gray-300 flex-shrink-0 ${isMobile ? 'mr-3' : 'mr-2'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (
                      e.target.value.length > 0 &&
                      suggestionsData &&
                      (suggestionsData.suggestions?.length > 0 || suggestionsData.popularSearches?.length > 0)
                    ) {
                      setShowSuggestionsDropdown(true);
                    } else {
                      setShowSuggestionsDropdown(false);
                    }
                  }}
                  onFocus={handleInputFocus}
                  onKeyPress={handleKeyPress}
                  placeholder="I want to make..."
                  className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-base"
                  style={{
                    fontSize: '16px', // Prevents zoom on iOS
                    height: isMobile ? '24px' : 'auto',
                    lineHeight: isMobile ? '24px' : 'normal',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 ${
                      isMobile ? 'ml-3 p-1' : 'ml-2'
                    }`}
                    style={{
                      width: isMobile ? '32px' : 'auto',
                      height: isMobile ? '32px' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="text-lg">×</span>
                  </button>
                )}
              </div>

              {showSuggestionsDropdown && shouldShowSuggestions && (
                <div 
                  className={`absolute mt-2 w-full rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-sm ${
                    isMobile ? 'max-h-80 overflow-y-auto' : ''
                  }`}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(229, 231, 235, 0.5)',
                    boxShadow: isDarkMode 
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
                      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {combinedSuggestions.slice(0, isMobile ? 6 : 10).map((s, i) => (
                    <div
                      key={i}
                      onClick={() => handleSearch(s.text)}
                      className={`px-4 cursor-pointer transition-all duration-200 flex items-center gap-3 group ${
                        isMobile ? 'py-4 min-h-[48px]' : 'py-3'
                      }`}
                      style={{
                        backgroundColor: 'transparent',
                        borderBottom: i < combinedSuggestions.slice(0, isMobile ? 6 : 10).length - 1 
                          ? (isDarkMode ? '1px solid rgba(75, 85, 99, 0.2)' : '1px solid rgba(229, 231, 235, 0.5)')
                          : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(249, 250, 251, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      {s.image && s.type === 'title' && (
                        <div className={`flex-shrink-0 rounded-lg overflow-hidden ring-2 ring-transparent group-hover:ring-purple-200 dark:group-hover:ring-purple-800 transition-all duration-200 ${
                          isMobile ? 'w-10 h-10' : 'w-12 h-12'
                        }`}>
                          <img
                            src={s.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'}
                            alt={s.text}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <div className="flex-1 flex justify-between items-center">
                        <span 
                          className={`font-medium transition-colors duration-200 ${
                            isMobile ? 'text-base' : 'text-sm'
                          }`}
                          style={{
                            color: isDarkMode ? '#f3f4f6' : '#374151'
                          }}
                        >
                          {s.text}
                        </span>
                      {s.type === "popular" && (
                          <span 
                            className={`px-2 py-1 rounded-full font-medium transition-all duration-200 ${
                              isMobile ? 'text-xs' : 'text-xs'
                            }`}
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                              color: isDarkMode ? '#4ade80' : '#16a34a',
                              border: isDarkMode ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)'
                            }}
                          >
                          Popular
                        </span>
                      )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {suggestionsData?.popularSearches?.length > 0 && (
              <div className="w-full mt-4 sm:mt-6 flex flex-col items-start">
                <div
                  className="text-xs font-semibold uppercase mb-3 sm:mb-2"
                  style={{
                    letterSpacing: '0.04em',
                    color: isDarkMode ? 'var(--text-secondary)' : '#9ca3af'
                  }}
                >
                  POPULAR SEARCHES
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {suggestionsData.popularSearches
                    .slice(0, showAllSuggestions ? suggestionsData.popularSearches.length : (isMobile ? 6 : 8))
                    .map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="font-medium text-sm px-3 py-2 rounded-full transition-all duration-200 border-2 border-transparent hover:border-[#00e6b2] focus:outline-none"
                        style={{
                          color: '#00e6b2',
                          backgroundColor: isDarkMode ? 'rgba(0, 230, 178, 0.1)' : 'rgba(0, 230, 178, 0.05)',
                          border: isDarkMode ? '1px solid rgba(0, 230, 178, 0.2)' : '1px solid rgba(0, 230, 178, 0.1)',
                          textTransform: 'capitalize',
                          minHeight: '40px',
                          minWidth: '80px',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? 'rgba(0, 230, 178, 0.2)' : 'rgba(0, 230, 178, 0.1)';
                          e.target.style.borderColor = '#00e6b2';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? 'rgba(0, 230, 178, 0.1)' : 'rgba(0, 230, 178, 0.05)';
                          e.target.style.borderColor = isDarkMode ? 'rgba(0, 230, 178, 0.2)' : 'rgba(0, 230, 178, 0.1)';
                        }}
                      >
                        {search}
                      </button>
                    ))}
                  {suggestionsData.popularSearches.length > (isMobile ? 6 : 8) && (
                    <button
                      onClick={() => setShowAllSuggestions((prev) => !prev)}
                      className="ml-2 text-xs font-semibold text-[#00e6b2] px-3 py-2 rounded-full transition-all duration-200 focus:outline-none"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(0, 230, 178, 0.1)' : 'rgba(0, 230, 178, 0.05)',
                        border: isDarkMode ? '1px solid rgba(0, 230, 178, 0.2)' : '1px solid rgba(0, 230, 178, 0.1)',
                        minHeight: '40px',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(0, 230, 178, 0.2)' : 'rgba(0, 230, 178, 0.1)';
                        e.target.style.borderColor = '#00e6b2';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(0, 230, 178, 0.1)' : 'rgba(0, 230, 178, 0.05)';
                        e.target.style.borderColor = isDarkMode ? 'rgba(0, 230, 178, 0.2)' : 'rgba(0, 230, 178, 0.1)';
                      }}
                    >
                      {showAllSuggestions ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-6 md:py-8">
          {searchData && (
            <div className="mb-6 sm:mb-6 md:mb-8">
              <h3
                className="text-xl sm:text-3xl md:text-4xl font-bold"
                style={{ color: isDarkMode ? 'var(--text-primary)' : '#000000' }}
              >
                {searchData.pagination.totalCount.toLocaleString()} RESULTS
              </h3>
            </div>
          )}
          {searchLoading && (
            <div className="py-8 sm:py-12">
              <RecipeGridSkeleton count={8} />
            </div>
          )}
          {searchError && (
            <Alert
              severity="error"
              className="mb-6 sm:mb-8"
            >
              Failed to load search results. Please try again.
            </Alert>
          )}
          {allRecipes && allRecipes.length > 0 && (
            <>
              {!isMobile && (
                <div
                  ref={scrollContainerRef}
                  className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                >
                  {allRecipes.map((recipe, index) => {
                    const isLast = index === allRecipes.length - 1;
                    return (
                      <Card
                        key={recipe.id}
                        ref={isLast ? lastRecipeElementRef : null}
                        className="flex flex-col sm:flex-col group cursor-pointer hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden"
                        style={{
                          backgroundColor: isDarkMode ? 'var(--card-bg)' : '#ffffff',
                          border: isDarkMode ? '1px solid var(--border-color)' : 'none'
                        }}
                        elevation={isDarkMode ? 0 : 2}
                      >
                        <div className="relative">
                          <CardMedia
                            component="img"
                            image={recipe.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'}
                            alt={recipe.title}
                            style={{
                              height: '160px',
                              width: '100%',
                              objectFit: 'cover',
                            }}
                            sx={{
                              height: { xs: '160px', sm: '180px', md: '200px' }
                            }}
                          />
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <IconButton
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                color: '#374151',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                width: { xs: '32px', sm: '36px', md: '40px' },
                                height: { xs: '32px', sm: '36px', md: '40px' },
                                '&:hover': {
                                  backgroundColor: 'white',
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (navigator.share) {
                                  navigator.share({
                                    title: recipe.title,
                                    text: `Check out this recipe: ${recipe.title}`,
                                    url: window.location.href,
                                  });
                                } else {
                                  navigator.clipboard.writeText(`${recipe.title} - ${window.location.href}`);
                                }
                              }}
                            >
                              <ShareIcon sx={{ fontSize: { xs: '16px', sm: '18px', md: '20px' } }} />
                            </IconButton>
                          </div>
                        </div>
                        <CardContent className="flex-grow p-3 sm:p-4 flex flex-col">
                          <Typography
                            variant="h6"
                            component="h3"
                            className="font-bold text-base sm:text-lg line-clamp-2"
                            style={{ color: isDarkMode ? 'var(--text-primary)' : '#000000' }}
                            sx={{
                              lineHeight: 1.2,
                              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                            }}
                          >
                            {recipe.title}
                          </Typography>
                          {recipe.authorName && (
                            <div className="flex items-center mb-2 mt-3">
                              <Typography
                                variant="body2"
                                className="text-sm mr-2"
                                style={{
                                  color: isDarkMode ? 'var(--text-secondary)' : '#6b7280',
                                  fontStyle: 'italic'
                                }}
                                sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                              >
                                By
                              </Typography>&nbsp;&nbsp;
                              {recipe.authorProfilePicture && (
                                <img
                                  src={recipe.authorProfilePicture}
                                  alt={recipe.authorName}
                                  className="w-6 h-6 rounded-full mr-2 object-cover"
                                />
                              )}
                              <Typography
                                variant="body2"
                                className="text-sm"
                                style={{
                                  color: isDarkMode ? 'var(--text-secondary)' : '#6b7280',
                                  fontStyle: 'italic'
                                }}
                                sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                              >
                                {recipe.authorName}
                              </Typography>
                            </div>
                          )}
                          <div className="flex-grow"></div>
                          <div className="flex items-center justify-end mt-3">
                            <TimeIcon
                              sx={{
                                fontSize: { xs: '16px', sm: '18px' },
                                color: isDarkMode ? '#a21caf' : '#a21caf'
                              }}
                            />&nbsp;
                            <Typography
                              variant="body2"
                              style={{ color: isDarkMode ? '#a21caf' : '#a21caf' }}
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {formatTime(recipe.totalTime)}
                            </Typography>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              {isMobile && (
                <div
                  ref={scrollContainerRef}
                  className="block sm:hidden space-y-3"
                >
                  {allRecipes.map((recipe, index) => {
                    const isLast = index === allRecipes.length - 1;
                    return (
                      <div
                        key={recipe.id}
                        ref={isLast ? lastRecipeElementRef : null}
                        className="active:scale-[0.98] transition-transform duration-150"
                      >
                        <div
                          className="flex rounded-xl shadow-md hover:shadow-lg overflow-hidden cursor-pointer"
                          style={{
                            backgroundColor: isDarkMode ? 'var(--card-bg)' : '#ffffff',
                            border: isDarkMode ? '1px solid var(--border-color)' : '1px solid #e5e7eb'
                          }}
                        >
                          <div className="w-28 h-28 flex-shrink-0 relative">
                            <img
                              src={recipe.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'}
                              alt={recipe.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          <div className="flex-1 p-4 flex flex-col justify-between min-h-[112px]">
                            <div className="flex-1">
                              <h3
                                className="font-bold text-sm leading-tight mb-2 line-clamp-2"
                                style={{ 
                                  color: isDarkMode ? 'var(--text-primary)' : '#000000',
                                  fontSize: '14px',
                                  lineHeight: '1.3'
                                }}
                              >
                                {recipe.title}
                              </h3>
                              {recipe.authorName && (
                                <div className="flex items-center mb-3">
                                  <p
                                    className="text-xs italic mr-1"
                                    style={{
                                      color: isDarkMode ? 'var(--text-secondary)' : '#6b7280'
                                    }}
                                  >
                                    by
                                  </p>
                                  {recipe.authorProfilePicture && (
                                    <img
                                      src={recipe.authorProfilePicture}
                                      alt={recipe.authorName}
                                      className="w-4 h-4 rounded-full mr-1 object-cover"
                                    />
                                  )}
                                  <p
                                    className="text-xs italic truncate"
                                    style={{
                                      color: isDarkMode ? 'var(--text-secondary)' : '#6b7280'
                                    }}
                                  >
                                    {recipe.authorName}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-end mt-auto">
                              <div className="flex items-center">
                                <TimeIcon
                                  sx={{
                                    fontSize: '16px',
                                    color: isDarkMode ? '#a21caf' : '#a21caf',
                                    marginRight: '4px'
                                  }}
                                />
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: isDarkMode ? '#a21caf' : '#a21caf' }}
                                >
                                  {formatTime(recipe.totalTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {searchData && searchData.recipes.length === 0 && !searchLoading && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 animate-fade-in">
              <div className="mb-6 sm:mb-8">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  className="mx-auto animate-bounce"
                >
                  <circle cx="40" cy="40" r="40" fill="#f3e8ff" />
                  <path d="M40 18c-7 0-13 5-13 12 0 6 5 11 11 12l2 0c6-1 11-6 11-12 0-7-6-12-13-12z" fill="#fff" />
                  <path d="M40 42c-7 0-13-5-13-12 0-7 6-12 13-12s13 5 13 12c0 7-6 12-13 12zm0-22c-6.1 0-11 4.5-11 10 0 5.5 4.9 10 11 10s11-4.5 11-10c0-5.5-4.9-10-11-10z" fill="#a21caf" />
                  <rect x="37" y="44" width="6" height="18" rx="3" fill="#a21caf" />
                </svg>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight animate-fade-in-up"
                style={{ color: isDarkMode ? 'var(--text-primary)' : '#111827' }}
              >
                OOPS!
              </h2>
              <Typography
                variant="h6"
                className="text-lg sm:text-xl font-semibold mb-1 animate-fade-in-up"
                style={{ color: isDarkMode ? 'var(--text-primary)' : '#374151' }}
                sx={{ letterSpacing: 1 }}
              >
                No Recipes Found
              </Typography>
              <Typography
                className="text-base sm:text-lg mb-6 animate-fade-in-up"
                style={{
                  color: isDarkMode ? 'var(--text-secondary)' : '#6b7280',
                  maxWidth: 400,
                  textAlign: 'center'
                }}
              >
                How about digging into some of our most popular stuff instead?
              </Typography>
              <button
                className="mt-2 px-6 py-2 rounded-full bg-[#a21caf] text-white font-semibold shadow-md hover:bg-[#86198f] transition-all duration-200 animate-fade-in-up"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                  setAllRecipes([]);
                  setHasMore(true);
                  setFilters({
                    category: '',
                    subCategory: '',
                    prepTime: null,
                    cookTime: null,
                    servingSize: null,
                  });
                  setSearchParams({});
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Explore Popular Recipes
              </button>
              <style>
                {`
                  .animate-fade-in { animation: fadeIn 0.8s ease; }
                  .animate-fade-in-up { animation: fadeInUp 0.8s ease; }
                  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                  @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: none; } }
                `}
              </style>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default Search;