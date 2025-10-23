
<script setup>
import PageLayout from '@/layouts/components/PageLayout.vue'
import BillingDetails from './billing.details/BillingDetails.vue'
import BillingPayCard from './billing.details/BillingPayCard.vue'
import BillingPayment from './billing.details/BillingPayment.vue'
import { useRoleStore } from '@/store/common/role-permission-store'
import { ClientPermissionServiceConstant } from '@/constant/permission'
const clientRoles = useRoleStore()
console.log(clientRoles.hasPermission(
                      ClientPermissionServiceConstant.BILLING_PROFILE_VIEW
                    ));

</script>


<template>
    <PageLayout title=" Billing Overview">
        <div class="max-w-3xl  min-h-screen mt-5">
            <div class="space-y-6">
                <BillingPayCard />
                <BillingPayment />
                <BillingDetails />
            </div>
        </div>
    </PageLayout>
</template>
