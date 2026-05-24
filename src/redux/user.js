import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { authService } from "../../firebase";
import { dbService } from "../../firebase";

const initialStateValue = {
  uid: "",
  nickName: "", //닉네임 양홍련
  email: "", //이메일
  grade: "🌱소중한 자모",
  visitCount: 0,
  postNumber: 0,
  commentNumber: 0,
};
//로그인
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        authService,
        email.trim(),
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(dbService, "User", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      return {
        uid: user.uid,
        nickName: userData.nickName || user.displayName || "Unknown",
        email: user.email,
        grade: userData.grade || "🌱소중한 자모",
        profileImg: userData.profileImg || "",
        visitCount: userData.visitCount || 0,
        postNumber: userData.postNumber || 0,
        commentNumber: userData.commentNumber || 0,
      };
    } catch (error) {
      return rejectWithValue({
        code: error.code,
        message: error.message,
      });
    }
  }
);

//로그아웃
export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(authService);
    } catch (error) {
      return rejectWithValue({
        code: error.code,
        message: error.message,
      });
    }
  }
);

// export const fetchUserData = createAsyncThunk(
//   "user/fetchUserData",
//   async (_, { rejectWithValue }) => {
//     try {
//       const user = authService.currentUser;
//       if (user) {
//         return {
//           nickName: user.displayName || "Unknown",
//           email: user.email,
//           profileImg: user.photoURL || "",
//           grade: user.grade,
//           visitCount: user.visitCount,
//           postNumber: user.postNumber,
//           commentNumber: user.commentNumber,
//         };
//       } else {
//         throw new Error("User not authenticated");
//       }
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );
export const userSlice = createSlice({
  name: "user",
  initialState: { value: initialStateValue, status: "idle", error: null },
  reducers: {
    login: (state, action) => {
      state.value = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    logout: (state) => {
      state.value = initialStateValue;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.value = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading"; // 로그아웃 요청이 진행중
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.value = initialStateValue;
        //로그아웃 작업이 완료되면 idle상태로 변경됨
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed"; //로그아웃 작업이 실패한 경우
        state.error = action.payload;
      });
    // .addCase(fetchUserData.pending, (state) => {
    //   state.status = "loading";
    // })
    // .addCase(fetchUserData.fulfilled, (state, action) => {
    //   state.status = "succeeded";
    //   state.value = action.payload;
    // })
    // .addCase(fetchUserData.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.error = action.payload;
    // });
  },
});

export default userSlice.reducer;
export const { login, logout, updateUser, setStatus, setError } =
  userSlice.actions;
