Travel planning web application

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following:

```
VITE_UNSPLASH_ACCESS_KEY=your_api_key_here
```

To get a free Unsplash API key:
1. Visit https://unsplash.com/developers
2. Create an account or sign in
3. Create a new application
4. Copy your Access Key and add it to `.env`

The API key is used to fetch copyright-free location images for destination cards.