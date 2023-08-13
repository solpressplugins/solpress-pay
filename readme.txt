=== SolPress WooCommerce Payment Gateway ===
Contributors: solpressplugins
Donate link: https://solpress.dev
Tags: solana pay, woocommerce, crypto payment, payment gateway, solana, crypto, phantom, phantom wallet, crypto woocommerce, payment crypto
Requires at least: 4.7
Tested up to: 6.1
Stable tag: 2.0.27
Requires PHP: 7.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Solana Pay for Woocommerce websites. Permissionless, open source, and fast payments. Funded by the Solana Foundation.

== Description ==
Allows for Solana Pay Payment Gateway on Woocommerce Stores. Currently supports USDC on Solana, or add any SPL (Solana Program Library) token to plugin settings. Supports all major Solana wallets like Phantom, Brave, or xNFT Backpack.

Adds a connect wallet button to the checkout page, after connecting wallet, users may pay in USDC (or other token) on Solana after clicking on Solana Pay button.

== Installation ==

1. Upload `solpress.php` to the `/wp-content/plugins/` directory
or Use WordPress’ Add New Plugin feature, search “solpress”,
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Add in your merchant wallet address and adjust any settings you would like

== Frequently Asked Questions ==

= Why Solana Pay? =

Solana Pay is a permissionless, open source and micro-fee way for merchants to allow purchase on their store to cryptocurrency users.

You can learn more on Solpress.dev and Solanapay.com 

== Screenshots ==

1. User frontend with Wallet connected at checkout and Solana Pay button displaying.
2. WordPress administrator/woocommerce merchant settings display.

== Changelog ==

= 2.0.27 =
* Fixed Phantom Wallet transaction failures on Desktop.
* Fixed Phanom Wallet transaction failures on Mobile.
* Updated code to use Wallet Standard.
* Added disconnect button.

= 2.0 =
* Added support for all popular Solana Wallets via Wallet Adapter
* Added support for any SPL token
* Fixed bug with payment button on checkout not showing under certain conditions
* Various other bug fixes

= 1.0 =
* Initial launch of plugin supporting Phantom wallet and USDC on Solana. 

= Bug Fixes =
### 2023.03.08
- Removed "Pay with Solpress" header on checkout page

### 2023.03.01
- Fixed fatal error that occurs when saving options due to previously declared function `my_custom_pricing_options_description`

### 2023.02.28
- Fixing file conflicts caused by version updates.

### 2023.02.24
- Fixed issue with saving custom currency failing.

### 2023.02.21
- Added fields for custom classes for payment buttons on the WC settings page.
- Removed "green shield" that shows on successful transactions.
- Change default RPC from mainnet-beta to extrnode.
- Fixed the dimension of the QR code rendered. 
- Fixed displaying a loader when "Pay here" button is clicked  

### 2023.01.15
- Moved bash script files into /utils
- Added User/Custom SPL token support. 
- Custom SPL token Symbol and Name is appended to existing available currencies list
- Now Validating transactions using User supplied RPC
- Enabled More Adapters