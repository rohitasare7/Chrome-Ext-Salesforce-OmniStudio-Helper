<script setup>
/* global chrome */
import { ref } from "vue";
import TextDesc from './elements/TextDesc.vue';
import PrimaryButton from "../components/elements/PrimaryButton.vue";
import SVGIconButton from "./elements/SVGIconButton.vue";
import Icon_Help from "@/assets/icons/Icon_Help.vue";
import Icon_Copy from "@/assets/icons/Icon_Copy.vue";
import LoadingCircle from "./elements/LoadingCircle.vue";

const isLoading = ref(false);
const formattedData = ref([]);
const showHelp = ref(false);
const webStoreURL = ref('https://chromewebstore.google.com/detail/salesforce-omnistudio-hel/gaogdijndgigjopjiidpemfglhokcmpe');
const isListEmpty = ref(false);
// Helper function to wrap chrome.tabs.query in a Promise
const getCurrentTab = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
};

// Helper function to wrap chrome.tabs.sendMessage in a Promise
const sendTabMessage = (tabId, message) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
};

// Main function to send message and handle response
const sendMessageOpenTab = async () => {
  try {
    const tab = await getCurrentTab();
    const response = await sendTabMessage(tab.id, { msg: "findObjects" });

    if (response && response.status === 'success') {
      //console.log('formattedData.value --> ' + JSON.stringify(response.data));
      if (response?.data?.length === 0) {
        isListEmpty.value = true;
      }
      else {
        isListEmpty.value = false;
      }

      formattedData.value = [];
      formattedData.value = groupData(response.data);
      return true;
    } else {
      console.log('Failed to find objects');
      return false;
    }
  } catch (error) {
    console.log('Error sending message:', error);
    return false;
  }
};

// Main fetch function
const fetchCompList = async () => {
  isLoading.value = true;

  try {
    await sendMessageOpenTab();
  } catch (error) {
    console.error('Error in fetchCompList:', error);
  } finally {
    isLoading.value = false;
  }
};

const groupData = (data) => {
  try {
    const grouped = {};
    data.forEach(item => {
      const { type, subtype } = item;
      if (!grouped[type]) {
        grouped[type] = {};
      }
      if (!grouped[type][subtype]) {
        grouped[type][subtype] = [];
      }
      grouped[type][subtype].push(item);
    });
    return grouped;
  }
  catch (err) {
    console.warn('groupData error --> ' + err);
    isLoading.value = false;
  }
}

const toggleShowHelp = () => {
  showHelp.value = !showHelp.value;
};

const triggerEmail = () => {
  const shareMessage = "Hey! checkout the Salesforce OmniStudio Helper Chrome extension at Official Chrome Web Store : " + webStoreURL.value;
  window.open('mailto:?subject=SF OmniStudio Helper Chrome Extension&body=' + shareMessage);
}

const sendHighlightMessage = (elementName, msg, popupText) => {
  // Send the message to the content script(s)
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { msg, elementName, popupText }, function (response) {
      if (chrome.runtime.lastError) {
        console.log('Error sending message:', chrome.runtime.lastError);
      } else {
        if (response && response.status === 'success') {
          console.log('sucess');
        }
      }
    });
  });
}

const copiedItemId = ref(null);
// Copy to clipboard function
const copyToClipboardStr = async (text) => {
  try {
    // Try using the modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard using Clipboard API');
      return true;
    } else {
      // Fallback for older browsers or insecure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        console.log('Copied to clipboard using execCommand');
        return true;
      } else {
        console.error('Failed to copy using execCommand');
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
}

const copyToClipboard = async (text, itemId, elementName) => {
  try {
    await copyToClipboardStr(text);
    copiedItemId.value = itemId;
    // Use elementName instead of itemId for removeHighlight
    //sendHighlightMessage(elementName, 'REMOVE_HIGHLIGHT', text);
    setTimeout(() => {
      copiedItemId.value = null;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

const handleCellClick = (item) => {
  copyToClipboard(item.name, item.name, item.elementName);
}
</script>

<template>

  <TextDesc class="font-semibold text-center !text-base mb-2">Salesforce OmniStudio Helper</TextDesc>

  <div v-if="!showHelp">
    <PrimaryButton :isBlue="true" @click="fetchCompList" class="mt-2">
      <LoadingCircle v-if="isLoading" :cssStyle="'h-4 w-4 mr-2'">Loading components...
      </LoadingCircle>
      <p v-else>Find OmniStudio Components</p>
    </PrimaryButton>

    <div v-if="isListEmpty" class="bg-white p-4 rounded-xl mt-4">
      <TextDesc class="font-semibold text-sm !text-gray-700">No OmniStudio Components Found</TextDesc>
    </div>

    <div v-if="formattedData" class="mt-4">
      <div v-for="(subtypes, type) in formattedData" :key="type" class="mb-4">
        <div v-for="(items, subtype) in subtypes" :key="subtype" class="mb-4">
          <h2 class="text-lg font-semibold mb-2">{{ type }} - {{ subtype }}</h2>
          <div class="relative overflow-x-auto rounded-lg overflow-hidden">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 border">
              <tbody>
                <tr v-for="item in items" :key="item.name">
                  <td
                    class="group px-4 py-2 bg-white text-gray-700 border-b hover:bg-blue-700 hover:text-white font-medium whitespace-nowrap cursor-pointer hover:shadow-2xl transition ease-in-out duration-300"
                    @mouseover="sendHighlightMessage(item.elementName, 'HIGHLIGHT_ELEMENT', item.name)"
                    @mouseleave="sendHighlightMessage(item.elementName, 'REMOVE_HIGHLIGHT', item.name)"
                    @click="handleCellClick(item)">
                    <div class="flex items-center">
                      {{ item.name }}
                      <Icon_Copy
                        class="w-4 h-4 stroke-2 transition duration-75 fill-gray-300 group-hover:fill-white dark:fill-blue-100 ml-2"
                        title="Copy Element Name" />
                      <span v-if="copiedItemId === item.name"
                        class="ml-2 text-xs bg-blue-800 text-white px-2 py-1 rounded">
                        Copied!
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="bg-white p-4 rounded-xl mt-4">
    <TextDesc class="font-semibold text-sm !text-blue-700 mb-2">To Access OmniStudio Components</TextDesc>
    <TextDesc>Open your Salesforce Org (Lightning Recommended) & click <b>OS Helper</b> button at right top corner.
      You can refer below image.
    </TextDesc>
    <img src="../assets/howToScreen.png" class="mt-2 py-2 pr-4 border rounded-lg">

    <TextDesc class="font-semibold text-sm mt-4 !text-blue-700 my-2">To Find OmniStudio Components</TextDesc>
    <TextDesc>Open your Salesforce Org Page on which you want to find components, Open Extension through Chrome Toolbar
      and click "Find OmniStudio Components"
    </TextDesc>

    <div class="mt-2 py-4 border-t">
      <TextDesc class="font-semibold text-sm my-2">Support Us by leaving a review or sharing this extension :
      </TextDesc>
      <div class="mt-4 flex items-center justify-start">
        <a class="text-blue-700 font-semibold mr-4" :href="webStoreURL" target="_blank">
          <PrimaryButton isBlue="true">
            Web Store Link
          </PrimaryButton>
        </a>
        <PrimaryButton isBlue="true" @click="triggerEmail">
          Share Extension
        </PrimaryButton>
      </div>
    </div>

    <div class="py-4 border-t">
      <TextDesc class="font-semibold text-sm my-2">Want to Debug OmniScript &amp; FlexCard?</TextDesc>
      <TextDesc class="text-sm">Try <a href="https://bit.ly/41BI2KG" target="_blank"
          class="text-blue-700 font-semibold mr-4">Salesforce OmniStudio Network Logger</a></TextDesc>
      <a href="https://bit.ly/41BI2KG" target="_blank"><img src="../assets/availableOnChrome.png"
          class="mt-2 border rounded-md"></a>
    </div>

    <div class="mt-6 flex items-center justify-end">
      <PrimaryButton @click="toggleShowHelp">
        Go Back
      </PrimaryButton>
    </div>


  </div>

  <SVGIconButton @click="toggleShowHelp" :icon="Icon_Help" :isSquare="false" color="green"
    class="!p-0.5 absolute top-3 right-3" title="Show Help" />

</template>

<script>
export default {
  name: 'mainPage',
}
</script>