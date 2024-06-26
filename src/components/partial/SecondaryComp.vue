<script setup>
/*global chrome*/
// import DisplayRecords from '@/components/partial/DisplayRecords';
import { ref, onMounted, shallowRef } from "vue";
import { apiVersion, sfConn, formatDate } from "@/assets/helper";
import { fetchRecords } from "@/assets/storageUtil";
import { saveRecord } from "@/assets/storageUtil";
import { extractValue, getSalesforceURL, getComponentQuery } from "@/assets/globalUtil";
import PrimaryButton from "../elements/PrimaryButton.vue";
import TextInput from "../elements/TextInput.vue";
import LoadingCircle from "../elements/LoadingCircle.vue";
import TextDesc from "../elements/TextDesc.vue";
import PrimaryHeading from "../elements/PrimaryHeading.vue";
import SVGIconButton from "../elements/SVGIconButton.vue";
import Icon_Favorite from "@/assets/icons/Icon_Favorite.vue";
import Icon_Execute from "@/assets/icons/Icon_Execute.vue";
import Icon_Close from "@/assets/icons/Icon_Close.vue";
import FavoriteTable from "./FavoriteTable.vue";
import Modal from "../elements/Modal.vue";
//Editor
import { HighCode } from "vue-highlight-code";
import "vue-highlight-code/dist/style.css";
// Vue3 Easy DataTable
import Vue3EasyDataTable from "vue3-easy-data-table";
import "vue3-easy-data-table/dist/style.css";
const recordList = ref([]);
const searchField = ref(["Name", "LastModifiedBy.Name", "LastModifiedDate"]);
const searchValue = ref("");
const sortBy = ref("LastModifiedDate");
const sortType = "desc";
//Id,Name,IsActive,VersionNumber,Type,SubType,LastModifiedDate,LastModifiedBy.Name
const tableHeaders = ref([]);

const recordTitle = ref("");
const dataLoading = ref(false);
const extLoading = ref(false);
const executeLoadingBtn = ref(false);
const sfHostURL = ref("");
const queriedObject = ref("");
const orgIdentifier = ref("");

const pageTitle = "Salesforce OmniStudio Helper";
const omniScriptLoaded = ref("OmniScripts Loaded" + " | " + pageTitle);
const flexCardsLoaded = ref("FlexCards Loaded" + " | " + pageTitle);
const IPloaded = ref("Integration Procedures Loaded" + " | " + pageTitle);
const DRloaded = ref("DataRaptors Loaded" + " | " + pageTitle);
const orgNameSpace = ref("");

const initData = async (url) => {
  console.log('inside initData 1');
  try {
    await sfConn.getSession(url);
    // Ensure the localStorage item is set
    const ns = localStorage.getItem(url + "_" + "ns");
    if (!orgNameSpace.value && ns) {
      orgNameSpace.value = getOrgNamspace();
      console.log('orgNameSpace.value 2 -> ' + orgNameSpace.value);
      setMainTableHeaders();
    }
    else {
      console.log('ns not found');
    }

  } catch (error) {
    console.error("Error getting session: ", error);
    throw error; // Throw error to propagate it to the caller
  }
};

const performAPIcallout = (url) => {
  // console.log('url --> '+url);
  return new Promise((resolve, reject) => {
    sfConn
      .getSession(sfHostURL.value)
      .then(() => {
        // console.log("getSession inside");
        let limitsPromise = sfConn.rest(url);
        limitsPromise
          .then((data) => {
            //console.log('limitsPromise data --> ', data);
            resolve(data); // Resolve the promise with the fetched data
          })
          .catch((error) => {
            console.error("Error fetching limits: ", error);
            reject(error); // Reject the promise if there is an error
          });
      })
      .catch((error) => {
        console.error("Error getting session: ", error);
        reject(error); // Reject the promise if there is an error getting the session
      });
  });
};

const performPostAPIcallout = (url, obj) => {
  return new Promise((resolve, reject) => {
    sfConn
      .getSession(sfHostURL.value)
      .then(() => {
        // console.log("getSession inside");
        let limitsPromise = sfConn.rest(url, obj);
        limitsPromise
          .then((data) => {
            //console.log('limitsPromise data --> ', data);
            resolve(data); // Resolve the promise with the fetched data
          })
          .catch((error) => {
            console.error("Error fetching limits: ", error);
            reject(error); // Reject the promise if there is an error
          });
      })
      .catch((error) => {
        console.error("Error getting session: ", error);
        reject(error); // Reject the promise if there is an error getting the session
      });
  });
};

const getOrgNS = async (sfHost) => {
  extLoading.value = true;
  console.log('sfHost --> ' + sfHost);
  let nsUrl = "/services/data/v" + apiVersion + "/query/?q=SELECT+Name,NamespacePrefix+FROM+ApexClass+WHERE+NAME='DRDataPackService'";
  if (localStorage.getItem(sfHost + "_" + 'ns') == null) {
    const nsResp = await performAPIcallout(nsUrl);
    if (nsResp.totalSize == 1 && nsResp.done && nsResp.records.length > 0) {
      localStorage.setItem(sfHost + "_" + 'ns', nsResp.records[0].NamespacePrefix);
      console.log('Namespace saved:', nsResp.records[0].NamespacePrefix);
      setMainTableHeaders(nsResp.records[0].NamespacePrefix);
    }

    let sandboxUrl = "/services/data/v" + apiVersion + "/query/?q=SELECT+IsSandbox,+InstanceName+FROM+Organization";
    const IS_SANDBOX = "isSandbox";
    const isSandBoxResp = await performAPIcallout(sandboxUrl);
    if (localStorage.getItem(sfHost + "_" + IS_SANDBOX) == null) {
      if (isSandBoxResp.records.length > 0) {
        localStorage.setItem(sfHost + "_" + IS_SANDBOX, isSandBoxResp.records[0].IsSandbox);
      }

    }
  }
  extLoading.value = false;
}

const setMainTableHeaders = () => {
  tableHeaders.value = [
    { text: "Id", value: "Id" },
    { text: "Name", value: "Name", sortable: true },
    // { text: "Version", value: "VersionNumber" },
    { text: "LastModified By", value: "LastModifiedBy.Name" },
    { text: "LastModified Date", value: "LastModifiedDateNew", sortable: true },
    { text: "Actions", value: "Actions", width: 300 },
  ];
};

const ensureVersionHeader = () => {
  let versionStr = "VersionNumber";
  if (orgNameSpace.value == "vlocity_cmt") {
    versionStr = "vlocity_cmt__Version__c";
  }

  const versionHeader = { text: "Version", value: versionStr };
  const isVersionHeaderPresent = tableHeaders.value.some(
    (header) => header.value === versionHeader.value
  );

  if (!isVersionHeaderPresent) {
    // Insert versionHeader at the 3rd position (index 2)
    tableHeaders.value.splice(2, 0, versionHeader);
  }
};

//Get OS & IP
const getOmniScriptList = async (isIP) => {
  dataLoading.value = true;
  queriedObject.value = "OmniScript";
  let processType = "OmniScript";
  if (isIP) {
    queriedObject.value = "IntegrationProcedure";
    processType = "Integration Procedure";
  }
  let url =
    "/services/data/v" +
    apiVersion +
    getComponentQuery(orgNameSpace.value, queriedObject.value);
  //  console.log('url --> '+url);
  try {
    const data = await performAPIcallout(url);
    //console.log('data --> ', JSON.stringify(data));
    data?.records.forEach((record) => {
      record.LastModifiedDateNew = formatDate(record.LastModifiedDate); //format the date time
      record.iconColor = getIconButtonColor(record.Id);
    });
    recordList.value = data?.records;
    recordTitle.value = isIP ? IPloaded.value : omniScriptLoaded.value;
    ensureVersionHeader();
  } catch (error) {
    console.error("Error fetching OmniScript list: ", error);
  }
  dataLoading.value = false;
  document.title = isIP ? IPloaded.value : omniScriptLoaded.value;
};

//Get FlexCards
const getFlexCardList = async () => {
  dataLoading.value = true;
  queriedObject.value = "FlexCard";
  let url =
    "/services/data/v" +
    apiVersion +
    getComponentQuery(orgNameSpace.value, queriedObject.value);
  try {
    const data = await performAPIcallout(url);
    //console.log('data --> ', JSON.stringify(data));
    data?.records.forEach((record) => {
      record.LastModifiedDateNew = formatDate(record.LastModifiedDate); //format the date time
      record.iconColor = getIconButtonColor(record.Id);
    });
    recordList.value = data?.records;
    recordTitle.value = flexCardsLoaded.value;
    ensureVersionHeader();
  } catch (error) {
    console.error("Error fetching getFlexCardList: ", error);
  }
  dataLoading.value = false;
  document.title = flexCardsLoaded.value;
};

//Get DataRaptor
const getDataRaptorList = async () => {
  dataLoading.value = true;
  queriedObject.value = "DataRaptor";

  let url =
    "/services/data/v" +
    apiVersion +
    getComponentQuery(orgNameSpace.value, queriedObject.value);
  try {
    let versionHeader = "VersionNumber"; // standard os version
    const data = await performAPIcallout(url);
    //console.log('data --> ', JSON.stringify(data));
    data?.records.forEach((record) => {
      record.LastModifiedDateNew = formatDate(record.LastModifiedDate); //format the date time
      record.iconColor = getIconButtonColor(record.Id);
    });
    recordList.value = data?.records;
    recordTitle.value = DRloaded.value;
    //set version header for vlocity
    if (orgNameSpace.value == "vlocity_cmt") {
      versionHeader = "vlocity_cmt__Version__c";
    }
    // remove version from header
    tableHeaders.value = tableHeaders.value.filter(
      (header) => header.value !== versionHeader
    );
  } catch (error) {
    console.error("Error fetching getDataRaptorList: ", error);
  }
  dataLoading.value = false;
  document.title = DRloaded.value;
};

const childComponentRef = ref(null);
//Save records to Favorite
const addToFavorite = (Id, Name) => {
  // console.log('queriedObject.value --> '+queriedObject.value);
  let obj = {
    type: queriedObject.value,
    id: Id,
    name: Name,
  };
  let result = saveRecord(obj, sfHostURL.value);
  if (result) {
    // console.log('inside result');
    childComponentRef.value.getLatestFavItemList();
    setIconColor(Id, "blue");
  }
};

const setIconColor = (Id, Color) => {
  const recordIndex = recordList.value.findIndex((item) => item.Id === Id);
  if (recordIndex !== -1) {
    recordList.value[recordIndex].iconColor = Color;
    // console.log('color changed --> ' + recordList.value[recordIndex].iconColor);
  }
};

const storageRecList = ref([]);
// Define the getIconButtonColor method
const getIconButtonColor = (id) => {
  const itemExists = storageRecList.value.some((record) =>
    record.items.some((item) => item.id === id)
  );
  // console.log('itemExists --> ' + itemExists);
  // Return blue color if the item exists, otherwise return gray
  if (itemExists) {
    return "blue";
  } else {
    return "gray";
  }
};

const handleEvent = (data) => {
  // console.log('event fired --> ' + JSON.stringify(data));
  if (data?.action == "deleteItem") {
    setIconColor(data?.recId, "gray");
    //storageRecList.value = storageRecList.value.filter(item => item.id !== data?.recId);
  }
};

const beautifyJSON = (jsonValue) => {
  try {
    responseJSON.value.modelValue = JSON.stringify(jsonValue, null, 2);
  } catch (error) {
    console.log("error --> " + error);
    responseJSON.value.modelValue = "Invalid JSON";
  }
};

//get namespace
const getOrgNamspace = () => {
  if (sfHostURL.value) {
    const namespace = localStorage.getItem(sfHostURL.value + "_" + "ns");
    return namespace !== null ? namespace : null;
  } else {
    return null;
  }
};
//code editor
const responseJSON = ref(null);
const requestJSON = ref(null);
const execuiteErr = ref("");

const apiCalloutBody = ref(null);
const apiResponse = ref(null);

const hitAPIcallout = async () => {
  executeLoadingBtn.value = true;
  execuiteErr.value = null;
  // responseJSON.value.modelValue = '';
  // console.log('obj --> ' + modalData.value.queriedObject);
  let url;
  let body;
  let orgNameSpace = getOrgNamspace();
  //console.log('modalData.value -->'+JSON.stringify(modalData.value));
  try {
    if (modalData.value?.queriedObject == "IntegrationProcedure") {
      url = `/services/apexrest/${orgNameSpace}/v1/integrationprocedure/${modalData.value.Type}_${modalData.value.SubType}`;
      body = requestJSON.value.modelValue;
    } else if (modalData?.value.queriedObject == "DataRaptor") {
      url = `/services/apexrest/${orgNameSpace}/v2/DataRaptor/`;
      body = {
        bundleName: modalData.value?.Name,
        objectList: requestJSON.value.modelValue,
        bulkUpload: modalData.value?.bulkUpload,
      };
      body = JSON.stringify(body);
    }

    //console.log('body --> ' + body);
    const response = await performPostAPIcallout(url, {
      method: "POST", // Use POST method for creating
      body: JSON.parse(body), // Pass the payload
    });

    // console.log('data --> ' + JSON.stringify(response));
    if (modalData?.value.queriedObject == "DataRaptor") {
      if (response?.hasErrors) {
        apiResponse.value = response?.errors ?? response?.returnResultsData;
      } else {
        apiResponse.value = response?.returnResultsData;
      }
    } else {
      apiResponse.value = response;
    }

    beautifyJSON(apiResponse.value);
    // responseJSON.value.modelValue = JSON.stringify(response, null, 4);
  } catch (err) {
    console.log(err);
    execuiteErr.value = err;
  }
  executeLoadingBtn.value = false;
};

//Modal Data
const showModal = ref(false);
const modalData = ref({});

const openModal = (queriedObject, Id, Type, SubType, Name) => {
  showModal.value = true;
  modalData.value = {
    Id,
    Type,
    SubType,
    queriedObject,
    Name,
  };
};

const closeModal = () => {
  showModal.value = false;
  execuiteErr.value = null;
  apiResponse.value = " ";
  if (responseJSON.value?.modelValue) {
    //console.log('responseJSON.value.modelValue --> '+responseJSON.value?.modelValue);
    responseJSON.value.modelValue = " ";
  } else {
    //console.log('na --> '+responseJSON.value);
    responseJSON.value.modelValue = " ";
  }
};
//On page load
onMounted(async () => {
  let args = new URLSearchParams(location.search.slice(1));
  let sfHost = args.get("host");
  sfHostURL.value = sfHost;
  orgIdentifier.value = extractValue(`https://${sfHostURL.value}`);
  storageRecList.value = await fetchRecords(sfHostURL.value);
  document.title = pageTitle;
  await getOrgNS(sfHost);
  await initData(sfHost);
});
</script>

<template>
  <!-- Init Main Page -->

  <div class="rounded-xl bg-white dark:bg-gray-800 dark:shadow p-3 sm:p-5">
    <div class="flex justify-between mb-4">
      <TextDesc v-if="sfHostURL">Current Org : <span class="font-semibold">{{ sfHostURL }}</span>
      </TextDesc>

      <TextDesc v-if="orgNameSpace" class="mr-3">Package :
        <span class="font-semibold">{{
          orgNameSpace == "omnistudio"
            ? "Standard OmniStudio"
            : "Vlocity OmniStudio"
        }}</span>
      </TextDesc>
      <div v-else>
        <TextDesc class="text-red-500 font-semibold" v-if="extLoading">
          <PrimaryButton>
            <LoadingCircle :cssStyle="'h-4 w-4 mr-2'">Fetching OmniStdio Package...</LoadingCircle>
          </PrimaryButton>
        </TextDesc>
        <TextDesc class="text-red-500 font-semibold" v-else>
          No OmniStudio Found
        </TextDesc>
      </div>

    </div>

    <div v-if="orgNameSpace" class="flex space-x-2">
      <PrimaryButton :isBlue="true" @click="getOmniScriptList(false)">
        Load OmniScript
      </PrimaryButton>
      <PrimaryButton :isBlue="true" @click="getFlexCardList">
        Load FlexCard
      </PrimaryButton>
      <PrimaryButton :isBlue="true" @click="getOmniScriptList(true)">
        Load Integration Procedure
      </PrimaryButton>
      <PrimaryButton :isBlue="true" @click="getDataRaptorList">
        Load DataRaptor
      </PrimaryButton>
    </div>
  </div>

  <div v-if="dataLoading" class="mt-4">
    <PrimaryButton>
      <LoadingCircle :cssStyle="'h-4 w-4 mr-2'">Data is loading...</LoadingCircle>
    </PrimaryButton>
  </div>
  <div v-else>
    <!--main block starts here-->
    <div v-if="recordTitle" class="mt-4 rounded-xl bg-white dark:bg-gray-800 dark:shadow p-3 sm:p-5">
      <div class="mb-2">
        <PrimaryHeading>Records loaded for
          <span class="text-blue-600 dark:text-blue-400">{{
            queriedObject
          }}</span>
        </PrimaryHeading>
        <TextDesc v-if="recordList.length > 0">All records are active records</TextDesc>
        <TextDesc v-else>No records found.</TextDesc>
      </div>
      <div v-if="recordList.length > 0">
        <TextInput v-model="searchValue" type="text" class="!px-3 !py-1.5 my-2 text-sm"
          placeholder="Filter records.." />
        <Vue3EasyDataTable :headers="tableHeaders" :items="recordList" :search-field="searchField" :rows-per-page="10"
          header-text-direction="center" body-text-direction="center" :search-value="searchValue" :sort-by="sortBy"
          :sort-type="sortType" :no-hover="true" :theme-color="'#312e3d'"
          table-class-name="tableCSS mt-4 mb-8 rounded-xl border dark:border-gray-600">
          <template #loading>
            <TextDesc class="font-semibold my-4">Data loading, please wait...</TextDesc>
          </template>
          <template #item-Name="{ Name }">
            <p class="text-left ml-2">{{ Name }}</p>
          </template>
          <template #item-Actions="{
            Id,
            Name,
            iconColor,
            Type,
            vlocity_cmt__Type__c,
            SubType,
            vlocity_cmt__SubType__c,
          }">
            <div class="flex justify-center text-center items-center my-1.5">
              <a :href="getSalesforceURL(orgIdentifier, sfHostURL, Id, queriedObject)
                " target="_blank">
                <PrimaryButton>Open in SF</PrimaryButton>
              </a>
              <SVGIconButton @click="addToFavorite(Id, Name)" :icon="Icon_Favorite" :isSquare="false" :color="iconColor"
                class="!p-1.5 ml-2" title="Add to Favorite" />

              <SVGIconButton v-if="
                queriedObject == 'DataRaptor' ||
                queriedObject == 'IntegrationProcedure'
              " @click="
                openModal(
                  queriedObject,
                  Id,
                  Type ?? vlocity_cmt__Type__c,
                  SubType ?? vlocity_cmt__SubType__c,
                  Name
                )
                " :icon="Icon_Execute" :isSquare="false" color="green" class="!p-1.5 ml-2"
                title="Execute with Payload" />
            </div>
          </template>
        </Vue3EasyDataTable>
      </div>
    </div>
    <!--main block ends here-->

    <!--favorites block starts here-->
    <div v-if="sfHostURL && recordList.length > 0">
      <FavoriteTable :sfHost="sfHostURL" :currenObject="queriedObject" ref="childComponentRef"
        @fireEvent="handleEvent" />
    </div>
    <!--favorites block ends here-->

    <!--footer/credits block ends here-->
    <div v-if="sfHostURL && recordList.length > 0" class="flex items-end justify-end mt-10">
      <TextDesc>Salesforce OmniStudio Helper by
        <a href="https://www.youtube.com/@ThatSalesforceGuy" target="_blank"
          class="text-blue-700 font-semibold dark:text-blue-400">That Salesforce Guy</a>
      </TextDesc>
    </div>
  </div>

  <Modal :show="showModal" @close="closeModal" :cssStyle="'mt-24 !max-w-screen-xl'">
    <button type="button" @click="closeModal"
      class="absolute top-3 end-3 text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-gray-600 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:bg-gray-600 dark:text-white dark:fill-gray-200 dark:hover:fill-white dark:hover:bg-gray-500 transition duration-200 ease-in-out">
      <Icon_Close class="w-6 h-6" />
      <span class="sr-only">Close modal</span>
    </button>
    <div v-if="modalData" class="p-6">
      <div class="flex justify-between items-center mb-4">
        <TextDesc>
          {{
            queriedObject == "IntegrationProcedure"
              ? "Integration Procedure"
              : "Data Raptor"
          }}
          : <span class="font-semibold">{{ modalData.Name }}</span></TextDesc>
        <PrimaryButton v-if="!executeLoadingBtn" :isBlue="true" @click="hitAPIcallout" class="mr-16">
          Execute
        </PrimaryButton>
        <PrimaryButton class="mr-16" v-else>
          <LoadingCircle :cssStyle="'h-4 w-4 mr-2'">Waiting for Response..</LoadingCircle>
        </PrimaryButton>
      </div>
      <div v-if="execuiteErr">
        <TextDesc class="text-red-600 font-semibold my-4">{{
          execuiteErr
        }}</TextDesc>
      </div>
      <div class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 mt-2">
        <div class="w-full lg:w-1/2 mr-3">
          <HighCode ref="requestJSON" :codeValue="apiCalloutBody" lang="json" textEditor="true" height="500px"
            width="100%" fontSize="12px" copy="true" class="dark:border dark:border-gray-700 dark:shadow"></HighCode>
        </div>
        <div class="w-full lg:w-1/2">
          <HighCode ref="responseJSON" :codeValue="apiResponse" lang="json" textEditor="true" height="500px"
            width="100%" fontSize="12px" copy="true" class="dark:border dark:border-gray-700 dark:shadow"></HighCode>
        </div>
      </div>
    </div>
    <!-- {{ apiResponse }} -->
  </Modal>
</template>

<script>
export default {
  name: "indexComp",
};
</script>
