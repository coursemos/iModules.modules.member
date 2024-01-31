<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 클라이언트를 가져온다.
 *
 * @file /modules/member/processes/oauth.client.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if (
    $me
        ->getAdmin()
        ->getAdministrator()
        ?->isMaster() !== true
) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$oauth_id = Request::get('oauth_id', true);
$data = $me
    ->db()
    ->select()
    ->from($me->table('oauth_clients'))
    ->where('oauth_id', $oauth_id)
    ->getOne();

if ($data === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

$data->allow_signup = $data->allow_signup == 'TRUE';

$results->success = true;
$results->data = $data;
