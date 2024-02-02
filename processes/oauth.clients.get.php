<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 클라이언트 목록을 가져온다.
 *
 * @file /modules/member/processes/oauth.clients.get.php
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

$clients = $me
    ->db()
    ->select(['oauth_id', 'scope'])
    ->from($me->table('oauth_clients'))
    ->orderBy('sort', 'asc')
    ->get();
foreach ($clients as &$client) {
    $client->scope = count($client->scope ? explode("\n", $client->scope) : []);
    $client->tokens = $me
        ->db()
        ->select()
        ->from($me->table('oauth_tokens'))
        ->where('oauth_id', $client->oauth_id)
        ->count();
}

$results->success = true;
$results->records = $clients;
