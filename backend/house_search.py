import pandas as pd
import os
from pathlib import Path

class HouseSearch:
    def __init__(self):
        self.df = None
        self.load_data()
    
    def load_data(self):
        """Load the house data from CSV"""
        try:
            csv_path = Path(__file__).parent / "train.csv"
            self.df = pd.read_csv(csv_path)
            
            # Clean column names
            self.df.columns = self.df.columns.str.strip().str.lower().str.replace(" ", "_")
            
            # Ensure saleprice is integer
            self.df['saleprice'] = self.df['saleprice'].astype(int)
            
            print(f"✅ Loaded {len(self.df)} houses from CSV")
            
        except Exception as e:
            print(f"❌ Error loading house data: {e}")
            self.df = pd.DataFrame()
    
    def get_houses_by_price(self, min_price, max_price):
        """Filter houses by price range"""
        if self.df is None or self.df.empty:
            return []
        
        try:
            filtered = self.df[(self.df['saleprice'] >= min_price) & (self.df['saleprice'] <= max_price)]
            
            if filtered.empty:
                return []
            
            # Select relevant columns and convert to dict
            result = filtered[['saleprice', 'lotshape', 'fullbath', 'bedroomabvgr', 'neighborhood']]
            return result.to_dict('records')
            
        except Exception as e:
            print(f"❌ Error filtering houses: {e}")
            return []
    
    def get_all_neighborhoods(self):
        """Get list of all unique neighborhoods"""
        if self.df is None or self.df.empty:
            return []
        
        try:
            return sorted(self.df['neighborhood'].unique().tolist())
        except Exception as e:
            print(f"❌ Error getting neighborhoods: {e}")
            return []
    
    def get_price_stats(self):
        """Get price statistics"""
        if self.df is None or self.df.empty:
            return {}
        
        try:
            return {
                'min_price': int(self.df['saleprice'].min()),
                'max_price': int(self.df['saleprice'].max()),
                'avg_price': int(self.df['saleprice'].mean()),
                'median_price': int(self.df['saleprice'].median()),
                'total_houses': len(self.df)
            }
        except Exception as e:
            print(f"❌ Error getting price stats: {e}")
            return {}
    
    def search_houses(self, filters):
        """Advanced house search with multiple filters"""
        if self.df is None or self.df.empty:
            return []
        
        try:
            filtered = self.df.copy()
            
            # Price range filter
            if filters.get('min_price'):
                filtered = filtered[filtered['saleprice'] >= filters['min_price']]
            if filters.get('max_price'):
                filtered = filtered[filtered['saleprice'] <= filters['max_price']]
            
            # Bedroom filter
            if filters.get('bedrooms'):
                filtered = filtered[filtered['bedroomabvgr'] >= filters['bedrooms']]
            
            # Bathroom filter
            if filters.get('bathrooms'):
                filtered = filtered[filtered['fullbath'] >= filters['bathrooms']]
            
            # Neighborhood filter
            if filters.get('neighborhood'):
                filtered = filtered[filtered['neighborhood'] == filters['neighborhood']]
            
            # Lot shape filter
            if filters.get('lot_shape'):
                filtered = filtered[filtered['lotshape'] == filters['lot_shape']]
            
            if filtered.empty:
                return []
            
            result = filtered[['saleprice', 'lotshape', 'fullbath', 'bedroomabvgr', 'neighborhood']]
            return result.to_dict('records')
            
        except Exception as e:
            print(f"❌ Error in advanced search: {e}")
            return []

# Global instance
house_search = HouseSearch()