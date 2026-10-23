<?php
/**
 * Title: Northstar Post List
 * Slug: northstar/post-list
 * Categories: northstar-landing, posts
 * Keywords: posts, query loop, blog
 * Inserter: false
 * Description: Query loop with title, date, excerpt and pagination.
 */
?>
<!-- wp:query {"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","inherit":true}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title {"level":2,"isLink":true} /-->

<!-- wp:post-date {"textColor":"secondary","fontSize":"small"} /-->

<!-- wp:post-excerpt /-->
<!-- /wp:post-template -->

<!-- wp:query-pagination {"layout":{"type":"flex","justifyContent":"space-between"}} -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results -->
<!-- wp:paragraph -->
<p><?php esc_html_e( 'Nothing to show here yet.', 'northstar' ); ?></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:query -->
