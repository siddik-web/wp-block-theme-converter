---
type: llm
focus: last_message
---

PASS if the reply explains that the saved HTML does not match the block's attributes (the
has-large-font-size class needs a matching "fontSize":"large" attribute in the block comment) and shows the
corrected markup, e.g. <!-- wp:paragraph {"fontSize":"large"} -->.
FAIL if it misdiagnoses the cause (e.g. blames caching or a missing plugin) or gives no corrected markup.
