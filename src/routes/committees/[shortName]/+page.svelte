<script lang="ts">
  import MarkdownBody from "$lib/components/MarkdownBody.svelte";
  import PositionGrid from "../PositionGrid.svelte";
  import EditCommitteeForm from "../EditCommitteeForm.svelte";
  import CommitteeHeader from "../CommitteeHeader.svelte";

  import type { PageData } from "./$types";
  export let data: PageData;
  let isEditing = false;
</script>

<CommitteeHeader
  committee={data.committee}
  uniqueMemberCount={data.uniqueMemberCount}
  numberOfMandates={data.numberOfMandates}
  editing={isEditing}
  toggleEditing={() => (isEditing = !isEditing)}
/>

<EditCommitteeForm form={data.form} open={isEditing} />

{#if data.markdown?.markdown}
  <MarkdownBody body={data.markdown.markdown} />
{/if}

<PositionGrid positions={data.positions} />
