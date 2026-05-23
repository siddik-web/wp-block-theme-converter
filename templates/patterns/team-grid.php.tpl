<?php
/**
 * Title: Team Grid
 * Slug: {{theme-slug}}/team-grid
 * Categories: team, featured
 * Keywords: team, people, staff, members, about
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Four-column team member grid with photo, name, title, and bio.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">

    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|20","margin":{"bottom":"var:preset|spacing|60"}}}} -->
    <div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:heading {"textAlign":"center","level":2} -->
        <h2 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Meet the Team', '{{text-domain}}' ); ?></h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center"><?php esc_html_e( 'The talented people behind our product.', '{{text-domain}}' ); ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns">

        <?php
        $team_members = array(
            array( 'name' => 'Sarah Chen',      'title' => 'CEO & Co-Founder' ),
            array( 'name' => 'Marcus Williams', 'title' => 'CTO & Co-Founder' ),
            array( 'name' => 'Elena Rodriguez', 'title' => 'Head of Design' ),
            array( 'name' => 'David Park',      'title' => 'Head of Engineering' ),
        );

        foreach ( $team_members as $member ) :
        ?>
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|30"}}} -->
            <div class="wp-block-group">
                <!-- wp:image {"align":"center","width":160,"height":160,"scale":"cover","className":"team-photo","style":{"border":{"radius":"50%"}}} -->
                <figure class="wp-block-image aligncenter team-photo" style="border-radius:50%">
                    <?php
                    /* translators: %s: team member name */
                    $alt = sprintf( esc_attr__( '%s photo', '{{text-domain}}' ), esc_attr( $member['name'] ) );
                    ?>
                    <img src="" alt="<?php echo $alt; ?>" width="160" height="160" style="object-fit:cover"/>
                </figure>
                <!-- /wp:image -->
                <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"4px"}}} -->
                <div class="wp-block-group">
                    <!-- wp:heading {"textAlign":"center","level":3,"style":{"typography":{"fontSize":"var:preset|font-size|medium","fontWeight":"700"}}} -->
                    <h3 class="wp-block-heading has-text-align-center"><?php echo esc_html( $member['name'] ); ?></h3>
                    <!-- /wp:heading -->
                    <!-- wp:paragraph {"align":"center","textColor":"primary","style":{"typography":{"fontWeight":"600","fontSize":"var:preset|font-size|small"}}} -->
                    <p class="has-text-align-center has-primary-color has-text-color" style="font-weight:600;font-size:var(--wp--preset--font-size--small)"><?php echo esc_html( $member['title'] ); ?></p>
                    <!-- /wp:paragraph -->
                    <!-- wp:paragraph {"align":"center","textColor":"muted","style":{"typography":{"fontSize":"var:preset|font-size|small"}}} -->
                    <p class="has-text-align-center has-muted-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'A brief bio sentence or two about this team member\'s background and expertise.', '{{text-domain}}' ); ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <?php endforeach; ?>

    </div>
    <!-- /wp:columns -->

</section>
<!-- /wp:group -->
