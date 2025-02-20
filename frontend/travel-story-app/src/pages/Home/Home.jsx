import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import TravelStoryCard from "../../components/Cards/TravelStoryCard";
import toast, { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import AddEditTravelStory from "./AddEditTravelStory";
import ViewTravelStory from "./ViewTravelStory";
import EmptyCard from "../../components/Cards/EmptyCard";
import Empty from "../../assets/images/empty.png";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import FilterTinfoTitle from "../../components/Cards/FilterTinfoTitle";
import { getEmptyCardImg, getEmptyCardMessage } from "../../utils/helper";

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShow: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShow: false,
    data: null,
  });

  // Fetch user info
  const getUserInfo = async () => {
    try {
      if (userInfo) return; // Prevent unnecessary API calls
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  //get all travel stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-travel-stories");
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred:", error);
    }
  };

  //hande edit story click
  const handleEdit = (data) => {
    setOpenAddEditModal({ isShow: true, type: "edit", data });
  };

  //handle story click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShow: true, data });
  };

  //handle favourite click
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;

    try {
      const response = await axiosInstance.put("/update-favourite/" + storyId, {
        isFavourite: !storyData.isFavourite,
      });

      if (response.data && response.data.story) {
        toast.success("Added Favourite story Successfully!", {
          removeDelay: 500,
        });
        if (filterType === "search" && searchQuery) {
          onSearchlStory(searchQuery);
        } else if (filterType === "date") {
          filterStoriesByDate(dateRange);
        } else {
          getAllTravelStories();
        }
      }
    } catch (error) {
      console.log("An unexpected error occurred:", error);
      toast.error("Failed to fetch stories. Please try again.", {
        removeDelay: 500,
      });
    }
  };

  //delete story
  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete(
        "/delete-travel-story/" + storyId
      );

      if (response.data && !response.data.error) {
        toast.error("Story deleted successfully!", { removeDelay: 500 });
        setOpenViewModal((prevState) => ({ ...prevState, isShow: false }));
        getAllTravelStories();
      }
    } catch (error) {
      console.log("An unexpected error occurred:", error);
      toast.error("Failed to fetch stories. Please try again.", {
        removeDelay: 500,
      });
    }
  };

  //search story
  const onSearchlStory = async (query) => {
    try {
      const response = await axiosInstance.get("/search-travel-stories", {
        params: {
          query,
        },
      });

      if (response.data && response.data.stories) {
        setFilterType("search");
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred:", error);
      toast.error("Failed to fetch stories. Please try again.", {
        removeDelay: 500,
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    getAllTravelStories();
  };

  //handle filter travel story by date range
  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null;

      if (startDate && endDate) {
        const response = await axiosInstance.get(
          "/filter-travel-stories/filter",
          {
            params: { startDate, endDate },
          }
        );

        if (response.data && response.data.stories) {
          setFilterType("date");
          setAllStories(response.data.stories);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch stories. Please try again.", {
        removeDelay: 500,
      });
    }
  };

  //handle date picker
  const handleDayClick = (range) => {
    setDateRange(range);
    if (range.from && range.to) {
      filterStoriesByDate(range);
    }
  };

  //reset filter
  const resetFilter = () => {
    setDateRange({ from: null, to: null });
    setFilterType("");
    getAllTravelStories();
  };

  //function handle fetch data
  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchlStory} // ✅ Corrected prop name
        handleClearSearch={handleClearSearch}
      />

      <Toaster position="top-right" />
      <div className="container max-auto py-10 px-6">
        <FilterTinfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => resetFilter()}
        />

        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 ">
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard
                      key={item._id}
                      imageUrl={item.imageUrl}
                      story={item.story}
                      title={item.title}
                      date={item.visitedDate}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavourite}
                      onEdit={() => handleEdit(item)}
                      onClick={() => handleViewStory(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard
                imgSrc={getEmptyCardImg(filterType)}
                message={getEmptyCardMessage(filterType)}
              />
            )}
          </div>
          <div className=" w-[350px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick} // ✅ Fix: Pass the selected date range properly
                  pagedNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* add & edit travel story modal */}
      <Modal
        isOpen={openAddEditModal.isShow}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShow: false, type: "add", data: null });
          }}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/* View story modal */}
      <Modal
        isOpen={openViewModal.isShow}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShow: false }));
          }}
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShow: false }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data || null);
          }}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShow: true, type: "add", data: null });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="28"
          height="28"
          strokeWidth="2.5"
          className="text-white"
        >
          <path d="M12 5l0 14"></path>
          <path d="M5 12l14 0"></path>
        </svg>
      </button>
    </>
  );
};

export default Home;
