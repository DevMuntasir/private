<script setup>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageLayout from "@/layouts/components/PageLayout.vue";
import { useBillingStore } from "@/store/client/client-billing-store";
import { Loader, PlusIcon } from "lucide-vue-next";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import BillingCountry from "../billing.country/BillingCountry.vue";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PaymentProfile from "../billing.payment.profile/PaymentProfile.vue";
import { ClientPermissionServiceConstant } from "@/constant/permission";
import { useRoleStore } from "@/store/common/role-permission-store";

const route = useRoute();
const mode = route.query.mode;
const showDialog = ref(false);
const clientRoles = useRoleStore()

const paymentProfile = ref();
const profileLoad = ref(false)
const addPaymentProfile = () => {
  showDialog.value = true;
};



const paymentProfileName = computed(
  () => paymentProfile.value?.legal_name || ""
);
const formData = reactive({
  country: "bangladesh",
  timezone: "gmt+06:00",
  currency: "bdt",
  paymentProfile: paymentProfileName,
  paymentMethod: "Credit Card",
  agreeToTerms: true,
});

defineProps({
  isTitle: Boolean,
});
const billinStore = useBillingStore();
onMounted(async () => {
  profileLoad.value = true
  let res = await billinStore.getClientPaymentInfo();
  paymentProfile.value = res.data.payment_profiles;
  console.log(res);
    profileLoad.value = false
});
</script>

<template>
  <PageLayout :title="`${mode} Billing`">
    <div class="max-w-3xl min-h-screen mt-5">
      <div class="space-y-6">
        <BillingCountry />
        <div v-if="billinStore.isBilling">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-sm font-medium text-gray-900 mb-4 font-primary text-[15px]">
              Payment profile
            </h3>

            <div class="relative">
              <Input
                v-model="formData.paymentProfile"
                type="text"
                readonly
                class="form-input"
                placeholder="Enter payment profile name"
              />
              <Dialog>
                <DialogTrigger>
                  <Button
                    v-if="
                    clientRoles.hasPermission(
                      ClientPermissionServiceConstant.PAYMENT_PROFILE_CREATE
                    ) 
                  "
                    @click="addPaymentProfile"
                    class="absolute btn right-1 top-1"
                  >
                    <PlusIcon class="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
          
                  <PaymentProfile
                    v-if="!profileLoad"
                    @close="showDialog = false"
                  />
            
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <!-- <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-sm font-medium text-gray-900 mb-4">
              Payment method
            </h3>
          </div> -->
        </div>
        <Loader v-if="billinStore.isLoading" />
      </div>
    </div>
    <!-- <BillingPaymentMethod :showPaymentMethod="showPaymentMethod" @close="showPaymentMethod = false" /> -->
  </PageLayout>
</template>
