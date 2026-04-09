import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import EncryptedStorage from "react-native-encrypted-storage";

const storeTokens = async (tokens) => {
  await EncryptedStorage.setItem("authData", JSON.stringify(tokens));
};

const getStoredTokens = async () => {
  const data = await EncryptedStorage.getItem("authData");
  return data ? JSON.parse(data) : null;
};

const clearStoredTokens = async () => {
  await EncryptedStorage.removeItem("authData");
};

export const loadAuthData = createAsyncThunk(
  "auth/loadAuthData",
  async (_, thunkAPI) => {
    try {
      const tokens = await getStoredTokens();
      return tokens;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    await clearStoredTokens();
    return true;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    authChecked: false,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken } = action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;

      storeTokens({ accessToken, refreshToken });
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(loadAuthData.fulfilled, (state, action) => {
        state.authChecked = true;

        if (action.payload?.accessToken) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
      })

      .addCase(loadAuthData.rejected, (state) => {
        state.authChecked = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;