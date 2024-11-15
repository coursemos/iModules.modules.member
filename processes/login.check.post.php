<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원의 유효성을 확인한다.
 *
 * @file /modules/member/processes/login.check.post.php
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2024. 11. 15.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['edit']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

if ($me->isLogged() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('REQUIRED_LOGIN');
} else {
    $errors = [];
    $password = Input::get('password', $errors);

    if (count($errors) == 0) {
        $member = $me->getMember($me->getLogged());
        $email = $member->getEmail();
        $origin_password = $member->getPassword();

        $verify = Password::verify($password, $origin_password);

        if ($verify) {
            $results->success = true;
        } else {
            $results->success = false;
            $results->message = $me->getErrorText('INVALID_PASSWORD');
        }
    } else {
        $results->success = false;
        $results->message = $me->getErrorText('INVALID_PASSWORD');
    }
}
