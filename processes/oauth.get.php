<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 로그인을 처리한다.
 *
 * @file /modules/member/processes/oauth.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 17.
 *
 * @var \modules\member\Member $me
 * @var string $path
 */
Header::type('html');

if ($path === null || strlen($path) == 0) {
    ErrorHandler::print(ErrorHandler::error('NOT_FOUND_URL'));
}

$oauth_id = $path;
$client = $me->getOAuthClient($oauth_id);
if ($client === null) {
    ErrorHandler::print($me->error('NOT_FOUND_OAUTH_CLIENT'));
}
$oauth = new OAuthClient($client->getClientId(), $client->getClientSecret());
$oauth->setScope($client->getScope());
$oauth->setRedirectUrl(isset($_SERVER['HTTP_REFERER']) == true ? $_SERVER['HTTP_REFERER'] : null);

if ($oauth->getAccessToken() === null) {
    if (Request::get('error') !== null) {
        ErrorHandler::print(
            $me->error(
                'OAUTH_AUTHENTICATION_REQUEST_FAILED',
                null,
                (object) [
                    'error' => Request::get('error'),
                    'description' => Request::get('error_description'),
                ]
            )
        );
    }

    if (Request::get('code') === null) {
        $oauth->redirectAuthenticationUrl($client->getAuthUrl());
    } else {
        $access_token = $oauth->getAccessTokenByCode($client->getTokenUrl(), Request::get('code'));
        if ($access_token === null) {
            ErrorHandler::print($me->error('OAUTH_AUTHENTICATION_FAILED'));
        }

        Header::location(Request::url(false));
    }
}

$account = new \modules\member\dtos\OAuthAccount($client, $oauth);
$me->loginByOAuth($account);
